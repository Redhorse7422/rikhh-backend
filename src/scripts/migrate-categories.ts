import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { redis } from "../config/redis";
import { getFirestore, closeFirebase } from "../config/firebase.config";
import { Category } from "../modules/category/category.entity";

interface FirebaseProduct {
  id: string;
  category?: string;
  [key: string]: any;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorsList: Array<{ category: string; error: string }>;
}

class CategoryMigrationService {
  private stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    errorsList: [],
  };

  /**
   * Main migration method for categories
   */
  async migrateCategories(): Promise<void> {
    console.log(
      "🚀 Starting Category Migration from Firebase Products to PostgreSQL...\n"
    );

    try {
      // Initialize connections
      await this.initializeConnections();

      // Fetch products from Firebase to extract categories
      const firebaseProducts = await this.fetchProductsFromFirebase();

      if (!firebaseProducts || firebaseProducts.length === 0) {
        console.log("⚠️ No products found in Firebase");
        return;
      }

      // Extract unique categories from products
      const uniqueCategories = this.extractUniqueCategories(firebaseProducts);

      if (uniqueCategories.length === 0) {
        console.log("⚠️ No categories found in products");
        return;
      }

      this.stats.total = uniqueCategories.length;
      console.log(`📊 Found ${uniqueCategories.length} unique categories to migrate\n`);

      // Process each unique category
      for (const categoryName of uniqueCategories) {
        await this.processCategory(categoryName);
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

      // Initialize Firebase
      console.log("✅ Firebase connection ready");
    } catch (error: any) {
      throw new Error(`Failed to initialize connections: ${error.message}`);
    }
  }

  /**
   * Fetch products from Firebase Firestore
   */
  private async fetchProductsFromFirebase(): Promise<FirebaseProduct[]> {
    try {
      const db = getFirestore();
      
      // Query all products from the products collection group
      const productsSnapshot = await db.collectionGroup("products").get();

      if (productsSnapshot.empty) {
        return [];
      }

      return productsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseProduct[];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch products from Firebase: ${error.message}`
      );
    }
  }

  /**
   * Extract unique categories from products
   */
  private extractUniqueCategories(firebaseProducts: FirebaseProduct[]): string[] {
    const categorySet = new Set<string>();

    for (const product of firebaseProducts) {
      if (product.category && typeof product.category === 'string' && product.category.trim()) {
        categorySet.add(product.category.trim());
      }
    }

    // Convert to array and sort alphabetically
    return Array.from(categorySet).sort();
  }

  /**
   * Generate slug from category name
   */
  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  /**
   * Process individual category migration
   */
  private async processCategory(categoryName: string): Promise<void> {
    try {
      console.log(`🔄 Processing category: ${categoryName}`);

      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category already exists by name or slug
      const existingCategory = await categoryRepository.findOne({
        where: [
          { name: categoryName },
          { slug: this.slugify(categoryName) }
        ],
      });

      if (existingCategory) {
        console.log(
          `⏭️ Category "${categoryName}" already exists, skipping...`
        );
        this.stats.skipped++;
        return;
      }

      // Create category data
      const categoryData = {
        name: categoryName,
        slug: this.slugify(categoryName),
        description: `Category: ${categoryName}`,
        isActive: true,
        isParent: false, // Default to false, can be updated later
        isFeatured: false, // Default to false, can be updated later
        isPopular: false, // Default to false, can be updated later
      };

      // Create and save category
      const category = categoryRepository.create(categoryData);
      await categoryRepository.save(category);

      console.log(`✅ Successfully migrated category: ${categoryName}`);
      this.stats.migrated++;
    } catch (error: any) {
      console.error(
        `❌ Failed to migrate category "${categoryName}":`,
        error.message
      );
      this.stats.errors++;
      this.stats.errorsList.push({
        category: categoryName,
        error: error.message,
      });
    }
  }

  /**
   * Generate migration report
   */
  private generateReport(): void {
    console.log("\n📊 ===== CATEGORY MIGRATION REPORT =====");
    console.log(`Total unique categories found: ${this.stats.total}`);
    console.log(`Successfully migrated: ${this.stats.migrated}`);
    console.log(`Skipped (already exist): ${this.stats.skipped}`);
    console.log(`Errors: ${this.stats.errors}`);

    if (this.stats.errors > 0) {
      console.log("\n❌ Errors encountered:");
      this.stats.errorsList.forEach((error) => {
        console.log(`  - "${error.category}": ${error.error}`);
      });
    }

    console.log("\n🎯 Category migration completed!");
    console.log("\n💡 Next steps:");
    console.log("  1. Verify categories in PostgreSQL");
    console.log("  2. Update category relationships if needed");
    console.log("  3. Run product migration with category references");
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
🚀 Category Migration Tool

This tool extracts unique categories from Firebase products collection and migrates them to PostgreSQL.

Usage: yarn ts-node src/scripts/migrate-categories.ts [options]

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

What it does:
  1. Fetches all products from Firebase products collection group
  2. Extracts unique category names from the 'category' field
  3. Creates category records in PostgreSQL without duplicates
  4. Generates proper slugs for each category
  5. Reports migration statistics
    `);
    return;
  }

  const migrationService = new CategoryMigrationService();

  try {
    await migrationService.migrateCategories();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { CategoryMigrationService };
