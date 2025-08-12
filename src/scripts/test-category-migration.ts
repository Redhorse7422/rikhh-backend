import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { getFirestore } from "../config/firebase.config";

/**
 * Test script to verify category migration setup
 * This script will:
 * 1. Test Firebase connection
 * 2. Test database connection
 * 3. Show sample categories from Firebase
 * 4. Verify category entity structure
 */
async function testCategoryMigration() {
  console.log("🧪 Testing Category Migration Setup...\n");

  try {
    // Test Firebase connection
    console.log("1️⃣ Testing Firebase connection...");
    const db = getFirestore();
    console.log("✅ Firebase connection successful");

    // Test database connection
    console.log("\n2️⃣ Testing PostgreSQL connection...");
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL connection successful");

    // Test Firebase products query
    console.log("\n3️⃣ Testing Firebase products query...");
    const productsSnapshot = await db.collectionGroup("products").limit(5).get();
    
    if (productsSnapshot.empty) {
      console.log("⚠️ No products found in Firebase");
    } else {
      console.log(`✅ Found ${productsSnapshot.size} products (limited to 5 for testing)`);
      
      // Show sample categories
      const categories = new Set<string>();
      productsSnapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.category && typeof data.category === 'string') {
          categories.add(data.category);
        }
      });

      if (categories.size > 0) {
        console.log("\n📋 Sample categories found:");
        Array.from(categories).slice(0, 10).forEach((category, index) => {
          console.log(`   ${index + 1}. ${category}`);
        });
        
        if (categories.size > 10) {
          console.log(`   ... and ${categories.size - 10} more`);
        }
      } else {
        console.log("⚠️ No categories found in products");
      }
    }

    // Test category entity
    console.log("\n4️⃣ Testing Category entity...");
    const categoryRepository = AppDataSource.getRepository("Category");
    if (categoryRepository) {
      console.log("✅ Category entity accessible");
      
      // Check if categories table exists and has records
      const categoryCount = await categoryRepository.count();
      console.log(`📊 Current categories in database: ${categoryCount}`);
    } else {
      console.log("❌ Category entity not accessible");
    }

    console.log("\n🎯 All tests completed successfully!");
    console.log("\n💡 Ready to run category migration:");
    console.log("   yarn ts-node src/scripts/migrate-categories.ts");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   1. Check Firebase credentials in .env");
    console.error("   2. Check database connection in .env");
    console.error("   3. Ensure Firebase Admin SDK is installed");
    console.error("   4. Verify database is running");
  } finally {
    try {
      await AppDataSource.destroy();
      console.log("\n🧹 Database connection closed");
    } catch (error) {
      console.warn("⚠️ Warning closing database:", error);
    }
  }
}

// Run the test
if (require.main === module) {
  testCategoryMigration();
}

export { testCategoryMigration };
