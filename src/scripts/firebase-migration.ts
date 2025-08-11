import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { redis } from "../config/redis";
import { User } from "../modules/user/user.entity";
import { Seller } from "../modules/seller/entities/seller.entity";
import { Role } from "../modules/role/entities/role.entity";
import { Permission } from "../modules/permissions/entities/permission.entity";
import { Address } from "../modules/address/address.entity";
import { Product } from "../modules/products/entities/product.entity";
import { Category } from "../modules/category/category.entity";
import { Cart } from "../modules/cart/entities/cart.entity";
import { Order } from "../modules/checkout/entities/order.entity";
import { OrderItem } from "../modules/checkout/entities/order-item.entity";
import { Coupon } from "../modules/coupon/coupon.entity";
import { MediaFile } from "../modules/media/media-file.entity";
import { Attribute } from "../modules/attributes/entities/attribute.entity";
import { AttributeValue } from "../modules/attributes/entities/attribute-value.entity";

// Firebase Admin SDK types (you'll need to install firebase-admin)
interface FirebaseDocument {
  id: string;
  [key: string]: any;
}

interface MigrationConfig {
  batchSize: number;
  dryRun: boolean;
  skipExisting: boolean;
  logLevel: "info" | "warn" | "error" | "debug";
}

class FirebaseMigrationService {
  private config: MigrationConfig;
  private migrationLog: any[] = [];

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      batchSize: 100,
      dryRun: false,
      skipExisting: false,
      logLevel: "info",
      ...config,
    };
  }

  private log(
    message: string,
    level: "info" | "warn" | "error" | "debug" = "info"
  ) {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);

      this.migrationLog.push({
        timestamp,
        level,
        message,
      });
    }
  }

  private shouldLog(level: "debug" | "info" | "warn" | "error"): boolean {
    const levels: Record<"debug" | "info" | "warn" | "error", number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.config.logLevel];
  }

  /**
   * Main migration method - orchestrates the entire migration process
   */
  async migrateAll(): Promise<void> {
    try {
      this.log("🚀 Starting Firebase to PostgreSQL migration...", "info");

      // Initialize database connection
      await this.initializeDatabase();

      // Migration order is important due to foreign key constraints
      const migrationSteps = [
        { name: "Permissions", method: () => this.migratePermissions() },
        { name: "Roles", method: () => this.migrateRoles() },
        { name: "Users", method: () => this.migrateUsers() },
        { name: "Addresses", method: () => this.migrateAddresses() },
        { name: "Sellers", method: () => this.migrateSellers() },
        { name: "Categories", method: () => this.migrateCategories() },
        { name: "Media Files", method: () => this.migrateMediaFiles() },
        { name: "Products", method: () => this.migrateProducts() },
        { name: "Attributes", method: () => this.migrateAttributes() },
        { name: "Carts", method: () => this.migrateCarts() },
        { name: "Coupons", method: () => this.migrateCoupons() },
        { name: "Orders", method: () => this.migrateOrders() },
        { name: "Order Items", method: () => this.migrateOrderItems() },
      ];

      for (const step of migrationSteps) {
        this.log(`📋 Starting migration: ${step.name}`, "info");
        await step.method();
        this.log(`✅ Completed migration: ${step.name}`, "info");
      }

      this.log("🎉 All migrations completed successfully!", "info");
      this.generateMigrationReport();
    } catch (error: any) {
      this.log(`❌ Migration failed: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      await redis.connect();
      this.log("✅ Database and Redis connections established", "info");
    } catch (error: any) {
      throw new Error(`Failed to initialize database: ${error.message}`);
    }
  }

  /**
   * Migrate sellers from Firebase to PostgreSQL
   */
  async migrateSellers(): Promise<void> {
    this.log("🔄 Starting seller migration...", "info");

    try {
      // This is where you would fetch data from Firebase
      // For now, I'll show the structure - you'll need to implement Firebase fetching
      const firebaseSellers = await this.fetchSellersFromFirebase();

      if (!firebaseSellers || firebaseSellers.length === 0) {
        this.log("⚠️ No sellers found in Firebase", "warn");
        return;
      }

      this.log(`📊 Found ${firebaseSellers.length} sellers to migrate`, "info");

      const sellerRepository = AppDataSource.getRepository(Seller);
      const userRepository = AppDataSource.getRepository(User);

      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // Process sellers in batches
      for (let i = 0; i < firebaseSellers.length; i += this.config.batchSize) {
        const batch = firebaseSellers.slice(i, i + this.config.batchSize);

        for (const firebaseSeller of batch) {
          try {
            // Check if seller already exists
            if (this.config.skipExisting) {
              const existingSeller = await sellerRepository.findOne({
                where: { documentId: firebaseSeller.id },
              });

              if (existingSeller) {
                this.log(
                  `⏭️ Skipping existing seller: ${firebaseSeller.id}`,
                  "debug"
                );
                skippedCount++;
                continue;
              }
            }

            // Transform Firebase data to PostgreSQL format
            const sellerData = this.transformSellerData(firebaseSeller);

            // Create new seller entity
            const seller = sellerRepository.create(sellerData);

            if (!this.config.dryRun) {
              await sellerRepository.save(seller);
            }

            migratedCount++;
            this.log(`✅ Migrated seller: ${firebaseSeller.id}`, "debug");
          } catch (error: any) {
            errorCount++;
            this.log(
              `❌ Failed to migrate seller ${firebaseSeller.id}: ${error.message}`,
              "error"
            );
          }
        }

        this.log(
          `📈 Processed batch ${
            Math.floor(i / this.config.batchSize) + 1
          }/${Math.ceil(firebaseSellers.length / this.config.batchSize)}`,
          "info"
        );
      }

      this.log(
        `🎯 Seller migration completed: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`,
        "info"
      );
    } catch (error: any) {
      throw new Error(`Seller migration failed: ${error.message}`);
    }
  }

  /**
   * Transform Firebase seller data to PostgreSQL format
   */
  private transformSellerData(
    firebaseSeller: FirebaseDocument
  ): Partial<Seller> {
    return {
      documentId: firebaseSeller.id, // Keep Firebase ID for reference
      userId: firebaseSeller.userId || null,
      businessName: firebaseSeller.businessName || null,
      businessDescription: firebaseSeller.businessDescription || null,
      businessPhone: firebaseSeller.businessPhone || null,
      businessEmail: firebaseSeller.businessEmail || null,
      businessWebsite: firebaseSeller.businessWebsite || null,
      businessAddress: firebaseSeller.businessAddress || null,
      businessCity: firebaseSeller.businessCity || null,
      businessState: firebaseSeller.businessState || null,
      businessPostalCode: firebaseSeller.businessPostalCode || null,
      businessCountry: firebaseSeller.businessCountry || null,
      taxId: firebaseSeller.taxId || null,
      licenseNumber: firebaseSeller.licenseNumber || null,
      status: firebaseSeller.status || "pending",
      verificationStatus: firebaseSeller.verificationStatus || "unverified",
      verificationDocuments: firebaseSeller.verificationDocuments || null,
      profileImage: firebaseSeller.profileImage || null,
      bannerImage: firebaseSeller.bannerImage || null,
      totalProducts: firebaseSeller.totalProducts || 0,
      totalSales: firebaseSeller.totalSales || 0,
      totalOrders: firebaseSeller.totalOrders || 0,
      totalRevenue: firebaseSeller.totalRevenue || 0,
      rating: firebaseSeller.rating || 0,
      reviewCount: firebaseSeller.reviewCount || 0,
      commissionRate: firebaseSeller.commissionRate || null,
      payoutMethod: firebaseSeller.payoutMethod || null,
      payoutDetails: firebaseSeller.payoutDetails || null,
      approvedBy: firebaseSeller.approvedBy || null,
      rejectionReason: firebaseSeller.rejectionReason || null,
      notes: firebaseSeller.notes || null,
      fcmToken: firebaseSeller.fcmToken || null,
      referralCode: firebaseSeller.referralCode || null,
      // createdAt and updatedAt will be set automatically by BaseEntity
    };
  }

  /**
   * Fetch sellers from Firebase (implement based on your Firebase setup)
   */
  private async fetchSellersFromFirebase(): Promise<FirebaseDocument[]> {
    // TODO: Implement Firebase fetching logic
    // This is a placeholder - you'll need to implement actual Firebase fetching

    // Example implementation:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const sellersSnapshot = await db.collection('sellers').get();
    // return sellersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    throw new Error(
      "Firebase fetching not implemented. Please implement fetchSellersFromFirebase method."
    );
  }

  /**
   * Placeholder methods for other entities - implement similar to sellers
   */
  async migratePermissions(): Promise<void> {
    this.log("🔄 Starting permissions migration...", "info");
    // TODO: Implement permissions migration
  }

  async migrateRoles(): Promise<void> {
    this.log("🔄 Starting roles migration...", "info");
    // TODO: Implement roles migration
  }

  async migrateUsers(): Promise<void> {
    this.log("🔄 Starting users migration...", "info");
    // TODO: Implement users migration
  }

  async migrateAddresses(): Promise<void> {
    this.log("🔄 Starting addresses migration...", "info");
    // TODO: Implement addresses migration
  }

  async migrateCategories(): Promise<void> {
    this.log("🔄 Starting categories migration...", "info");
    // TODO: Implement categories migration
  }

  async migrateMediaFiles(): Promise<void> {
    this.log("🔄 Starting media files migration...", "info");
    // TODO: Implement media files migration
  }

  async migrateProducts(): Promise<void> {
    this.log("🔄 Starting products migration...", "info");
    // TODO: Implement products migration
  }

  async migrateAttributes(): Promise<void> {
    this.log("🔄 Starting attributes migration...", "info");
    // TODO: Implement attributes migration
  }

  async migrateCarts(): Promise<void> {
    this.log("🔄 Starting carts migration...", "info");
    // TODO: Implement carts migration
  }

  async migrateCoupons(): Promise<void> {
    this.log("🔄 Starting coupons migration...", "info");
    // TODO: Implement coupons migration
  }

  async migrateOrders(): Promise<void> {
    this.log("🔄 Starting orders migration...", "info");
    // TODO: Implement orders migration
  }

  async migrateOrderItems(): Promise<void> {
    this.log("🔄 Starting order items migration...", "info");
    // TODO: Implement order items migration
  }

  /**
   * Generate migration report
   */
  private generateMigrationReport(): void {
    this.log("📊 Migration Report:", "info");
    this.log(`Total log entries: ${this.migrationLog.length}`, "info");

    const errorCount = this.migrationLog.filter(
      (log) => log.level === "error"
    ).length;
    const warnCount = this.migrationLog.filter(
      (log) => log.level === "warn"
    ).length;

    this.log(`Errors: ${errorCount}`, errorCount > 0 ? "error" : "info");
    this.log(`Warnings: ${warnCount}`, warnCount > 0 ? "warn" : "info");
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    try {
      await AppDataSource.destroy();
      await redis.disconnect();
      this.log("🧹 Cleanup completed", "info");
    } catch (error: any) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, "warn");
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const config: Partial<MigrationConfig> = {
    dryRun: args.includes("--dry-run"),
    skipExisting: args.includes("--skip-existing"),
    logLevel: args.includes("--debug") ? "debug" : "info",
  };

  const migrationService = new FirebaseMigrationService(config);

  try {
    await migrationService.migrateAll();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await migrationService.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { FirebaseMigrationService };
