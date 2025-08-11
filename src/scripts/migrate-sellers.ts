import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { redis } from "../config/redis";
import { getFirestore, closeFirebase } from "../config/firebase.config";
import {
  Seller,
  SELLER_STATUS,
  SELLER_VERIFICATION_STATUS,
} from "../modules/seller/entities/seller.entity";
import { User } from "../modules/user/user.entity";
import { USER_TYPE } from "../constants/user";

interface FirebaseSeller {
  id: string;
  userId?: string;
  shopName?: string;
  name?: string;
  businessDescription?: string;
  phone?: string;
  email?: string;
  businessWebsite?: string;
  shopAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  taxId?: string;
  licenseNumber?: string;
  licenseExpiryDate?: any;
  status?: string;
  verificationStatus?: string;
  verificationDocuments?: string;
  profileImage?: string;
  bannerImage?: string;
  totalProducts?: number;
  totalSales?: number;
  totalOrders?: number;
  totalRevenue?: number;
  rating?: number;
  reviewCount?: number;
  commissionRate?: number;
  payoutMethod?: string;
  payoutDetails?: string;
  approvedAt?: any;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
  fcmToken?: string;
  referralCode?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorsList: Array<{ id: string; error: string }>;
}

class SellerMigrationService {
  private stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    errorsList: [],
  };

  /**
   * Main migration method for sellers
   */
  async migrateSellers(): Promise<void> {
    console.log(
      "🚀 Starting Seller Migration from Firebase to PostgreSQL...\n"
    );

    try {
      // Initialize connections
      await this.initializeConnections();

      // Fetch sellers from Firebase
      const firebaseSellers = await this.fetchSellersFromFirebase();

      if (!firebaseSellers || firebaseSellers.length === 0) {
        console.log("⚠️ No sellers found in Firebase");
        return;
      }

      this.stats.total = firebaseSellers.length;
      console.log(`📊 Found ${firebaseSellers.length} sellers to migrate\n`);

      // Process each seller
      for (const firebaseSeller of firebaseSellers) {
        await this.processSeller(firebaseSeller);
      }

      // Generate final report
      this.generateReport();
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Initialize database and Firebase connections
   */
  private async initializeConnections(): Promise<void> {
    try {
      // Initialize PostgreSQL
      await AppDataSource.initialize();
      console.log("✅ PostgreSQL connection established");

      // Initialize Redis
      await redis.connect();
      console.log("✅ Redis connection established");

      // Initialize Firebase (this will be done when getFirestore is called)
      console.log("✅ Firebase connection ready");
    } catch (error: any) {
      throw new Error(`Failed to initialize connections: ${error.message}`);
    }
  }

  /**
   * Fetch sellers from Firebase Firestore
   */
  private async fetchSellersFromFirebase(): Promise<FirebaseSeller[]> {
    try {
      const db = getFirestore();
      const sellersSnapshot = await db.collection("sellers").get();

      if (sellersSnapshot.empty) {
        return [];
      }

      return sellersSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseSeller[];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch sellers from Firebase: ${error.message}`
      );
    }
  }

  /**
   * Ensure user exists for seller, create if necessary
   */
  private async ensureUserForSeller(
    firebaseSeller: FirebaseSeller
  ): Promise<string> {
    try {
      const userRepository = AppDataSource.getRepository(User);

      // Try to find existing user by documentId first (if seller had a userId)
      if (firebaseSeller.userId) {
        const existingUser = await userRepository.findOne({
          where: { documentId: firebaseSeller.userId },
        });

        if (existingUser) {
          console.log(
            `👤 Found existing user for seller ${firebaseSeller.id}: ${existingUser.id}`
          );
          return existingUser.id;
        }
      }

      // Create new user from seller information
      const userData = {
        documentId: firebaseSeller.id || `seller_${firebaseSeller.id}`, // Use seller's userId or generate one
        email:
          firebaseSeller.email || `seller_${firebaseSeller.id}@migrated.com`,
        password: "password", // Default password as requested
        firstName: firebaseSeller.name?.split(" ")[0] || "",
        lastName: firebaseSeller.name?.split(" ").slice(1).join(" ") || "",
        phone: firebaseSeller.phone || undefined,
        type: "seller" as any,
        isActive: firebaseSeller.status === "approved" ? true : false,
        emailVerified: true,
      };

      const newUser = userRepository.create(userData);
      const savedUser = await userRepository.save(newUser);

      console.log(
        `👤 Created new user for seller ${firebaseSeller.id}: ${savedUser.id}`
      );
      return savedUser.id;
    } catch (error: any) {
      throw new Error(
        `Failed to ensure user for seller ${firebaseSeller.id}: ${error.message}`
      );
    }
  }

  /**
   * Process individual seller migration
   */
  private async processSeller(firebaseSeller: FirebaseSeller): Promise<void> {
    try {
      console.log(`🔄 Processing seller: ${firebaseSeller.id}`);

      const sellerRepository = AppDataSource.getRepository(Seller);

      // Check if seller already exists
      const existingSeller = await sellerRepository.findOne({
        where: { documentId: firebaseSeller.id },
      });

      if (existingSeller) {
        console.log(
          `⏭️ Seller ${firebaseSeller.id} already exists, skipping...`
        );
        this.stats.skipped++;
        return;
      }

      // Create or get user for this seller
      const userId = await this.ensureUserForSeller(firebaseSeller);

      // Transform Firebase data to PostgreSQL format
      const sellerData = this.transformSellerData(firebaseSeller, userId);

      // Create and save seller
      const seller = sellerRepository.create(sellerData);
      await sellerRepository.save(seller);

      console.log(`✅ Successfully migrated seller: ${firebaseSeller.id}`);
      this.stats.migrated++;
    } catch (error: any) {
      console.error(
        `❌ Failed to migrate seller ${firebaseSeller.id}:`,
        error.message
      );
      this.stats.errors++;
      this.stats.errorsList.push({
        id: firebaseSeller.id,
        error: error.message,
      });
    }
  }

  /**
   * Transform Firebase seller data to PostgreSQL format
   */
  private transformSellerData(
    firebaseSeller: FirebaseSeller,
    userId: string
  ): Partial<Seller> {
    return {
      documentId: firebaseSeller.id, // Keep Firebase ID for reference
      userId: userId, // Use the provided userId
      businessName: firebaseSeller.shopName || "",
      businessDescription: firebaseSeller.businessDescription || "",
      businessPhone: firebaseSeller.phone || "",
      businessEmail: firebaseSeller.email || "",
      businessWebsite: firebaseSeller.businessWebsite || "",
      businessAddress: firebaseSeller.shopAddress || "",
      businessCity: firebaseSeller.businessCity || "",
      businessState: firebaseSeller.businessState || "",
      businessPostalCode: firebaseSeller.businessPostalCode || "",
      businessCountry: firebaseSeller.businessCountry || "",
      taxId: firebaseSeller.taxId || "",
      licenseNumber: firebaseSeller.licenseNumber || "",
      status: this.mapSellerStatus(firebaseSeller.status),
      verificationStatus: this.mapVerificationStatus(
        firebaseSeller.verificationStatus
      ),
      verificationDocuments: firebaseSeller.verificationDocuments || "",
      profileImage: firebaseSeller.profileImage || "",
      bannerImage: firebaseSeller.bannerImage || "",
      totalProducts: firebaseSeller.totalProducts || 0,
      totalSales: firebaseSeller.totalSales || 0,
      totalOrders: firebaseSeller.totalOrders || 0,
      totalRevenue: firebaseSeller.totalRevenue || 0,
      rating: firebaseSeller.rating || 0,
      reviewCount: firebaseSeller.reviewCount || 0,
      commissionRate: firebaseSeller.commissionRate || 0,
      payoutMethod: firebaseSeller.payoutMethod || "",
      payoutDetails: firebaseSeller.payoutDetails || "",
      // approvedAt: this.parseDate(firebaseSeller.approvedAt),
      approvedBy: firebaseSeller.approvedBy || "",
      rejectionReason: firebaseSeller.rejectionReason || "",
      notes: firebaseSeller.notes || "",
      fcmToken: firebaseSeller.fcmToken || "",
      referralCode: firebaseSeller.referralCode || "",
    };
  }

  /**
   * Parse date from Firebase timestamp or string
   */
  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    try {
      if (dateValue.toDate) {
        // Firebase Timestamp
        return dateValue.toDate();
      } else if (dateValue.seconds) {
        // Firebase Timestamp object
        return new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === "string") {
        // ISO string
        return new Date(dateValue);
      } else if (dateValue instanceof Date) {
        // Already a Date object
        return dateValue;
      }
    } catch (error) {
      console.warn(`⚠️ Could not parse date: ${dateValue}`, error);
    }

    return null;
  }

  /**
   * Map Firebase status to PostgreSQL enum
   */
  private mapSellerStatus(status?: string): SELLER_STATUS {
    if (!status) return SELLER_STATUS.PENDING;

    const statusMap: { [key: string]: SELLER_STATUS } = {
      pending: SELLER_STATUS.PENDING,
      approved: SELLER_STATUS.APPROVED,
      rejected: SELLER_STATUS.REJECTED,
      suspended: SELLER_STATUS.SUSPENDED,
      inactive: SELLER_STATUS.INACTIVE,
    };

    return statusMap[status.toLowerCase()] || SELLER_STATUS.PENDING;
  }

  /**
   * Map Firebase verification status to PostgreSQL enum
   */
  private mapVerificationStatus(status?: string): SELLER_VERIFICATION_STATUS {
    if (!status) return SELLER_VERIFICATION_STATUS.UNVERIFIED;

    const statusMap: { [key: string]: SELLER_VERIFICATION_STATUS } = {
      unverified: SELLER_VERIFICATION_STATUS.UNVERIFIED,
      pending: SELLER_VERIFICATION_STATUS.PENDING,
      verified: SELLER_VERIFICATION_STATUS.VERIFIED,
      rejected: SELLER_VERIFICATION_STATUS.REJECTED,
    };

    return (
      statusMap[status.toLowerCase()] || SELLER_VERIFICATION_STATUS.UNVERIFIED
    );
  }

  /**
   * Generate migration report
   */
  private generateReport(): void {
    console.log("\n📊 ===== MIGRATION REPORT =====");
    console.log(`Total sellers found: ${this.stats.total}`);
    console.log(`Successfully migrated: ${this.stats.migrated}`);
    console.log(`Skipped (already exist): ${this.stats.skipped}`);
    console.log(`Errors: ${this.stats.errors}`);

    if (this.stats.errors > 0) {
      console.log("\n❌ Errors encountered:");
      this.stats.errorsList.forEach((error) => {
        console.log(`  - ${error.id}: ${error.error}`);
      });
    }

    console.log("\n🎯 Migration completed!");
  }

  /**
   * Cleanup connections
   */
  private async cleanup(): Promise<void> {
    try {
      await AppDataSource.destroy();
      await redis.disconnect();
      await closeFirebase();
      console.log("🧹 All connections closed");
    } catch (error) {
      console.warn("⚠️ Warning during cleanup:", error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🚀 Seller Migration Tool

Usage: yarn ts-node src/scripts/migrate-sellers.ts [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be migrated without actually doing it
  --verbose      Show detailed logging

Environment Variables Required:
  FIREBASE_PROJECT_ID
  FIREBASE_PRIVATE_KEY
  FIREBASE_CLIENT_EMAIL
  FIREBASE_DATABASE_URL (optional)
  
  DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
  REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (optional)
    `);
    return;
  }

  const migrationService = new SellerMigrationService();

  try {
    await migrationService.migrateSellers();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SellerMigrationService };
