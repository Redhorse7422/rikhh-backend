import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { getFirestore } from "../config/firebase.config";

/**
 * Test script to verify product migration setup
 * This script will:
 * 1. Test Firebase connection
 * 2. Test database connection
 * 3. Show sample products from Firebase
 * 4. Verify product entity structure
 * 5. Check if categories exist
 * 6. Check if sellers exist
 */
async function testProductMigration() {
  console.log("🧪 Testing Product Migration Setup...\n");

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
      
      // Show sample products
      console.log("\n📋 Sample products found:");
      productsSnapshot.docs.forEach((doc: any, index: number) => {
        const data = doc.data();
        console.log(`\n   ${index + 1}. Product ID: ${doc.id}`);
        console.log(`      Name: ${data.name || 'N/A'}`);
        console.log(`      Category: ${data.category || 'N/A'}`);
        console.log(`      Description: ${data.description ? data.description.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`      Price: ${data.price || 'N/A'}`);
        console.log(`      Images: ${data.images ? data.images.length : 0} images`);
        if (data.images && data.images.length > 0) {
          console.log(`      First image: ${data.images[0].substring(0, 80)}...`);
        }
        console.log(`      Seller ID: ${data.sellerId || 'N/A'}`);
        console.log(`      User ID: ${data.userId || 'N/A'}`);
      });
    }

    // Test product entity
    console.log("\n4️⃣ Testing Product entity...");
    const productRepository = AppDataSource.getRepository("Product");
    if (productRepository) {
      console.log("✅ Product entity accessible");
      
      // Check if products table exists and has records
      const productCount = await productRepository.count();
      console.log(`📊 Current products in database: ${productCount}`);
    } else {
      console.log("❌ Product entity not accessible");
    }

    // Test category entity
    console.log("\n5️⃣ Testing Category entity...");
    const categoryRepository = AppDataSource.getRepository("Category");
    if (categoryRepository) {
      console.log("✅ Category entity accessible");
      
      // Check if categories table exists and has records
      const categoryCount = await categoryRepository.count();
      console.log(`📊 Current categories in database: ${categoryCount}`);
      
      if (categoryCount > 0) {
        const categories = await categoryRepository.find({ take: 5 });
        console.log("📋 Sample categories:");
        categories.forEach((cat: any, index: number) => {
          console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
        });
      }
    } else {
      console.log("❌ Category entity not accessible");
    }

    // Test seller entity
    console.log("\n6️⃣ Testing Seller entity...");
    const sellerRepository = AppDataSource.getRepository("Seller");
    if (sellerRepository) {
      console.log("✅ Seller entity accessible");
      
      // Check if sellers table exists and has records
      const sellerCount = await sellerRepository.count();
      console.log(`📊 Current sellers in database: ${sellerCount}`);
      
      if (sellerCount > 0) {
        const sellers = await sellerRepository.find({ take: 3 });
        console.log("📋 Sample sellers:");
        sellers.forEach((seller: any, index: number) => {
          console.log(`   ${index + 1}. ${seller.businessName} (${seller.documentId})`);
        });
      }
    } else {
      console.log("❌ Seller entity not accessible");
    }

    // Test media file entity
    console.log("\n7️⃣ Testing MediaFile entity...");
    const mediaFileRepository = AppDataSource.getRepository("MediaFile");
    if (mediaFileRepository) {
      console.log("✅ MediaFile entity accessible");
      
      // Check if media_files table exists and has records
      const mediaFileCount = await mediaFileRepository.count();
      console.log(`📊 Current media files in database: ${mediaFileCount}`);
    } else {
      console.log("❌ MediaFile entity not accessible");
    }

    console.log("\n🎯 All tests completed successfully!");
    console.log("\n💡 Ready to run product migration:");
    console.log("   # Test with 2 products first:");
    console.log("   yarn ts-node src/scripts/migrate-products.ts --test");
    console.log("\n   # Run full migration:");
    console.log("   yarn ts-node src/scripts/migrate-products.ts");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("   1. Check Firebase credentials in .env");
    console.error("   2. Check database connection in .env");
    console.error("   3. Check AWS credentials in .env");
    console.error("   4. Ensure Firebase Admin SDK is installed");
    console.error("   5. Verify database is running");
    console.error("   6. Verify AWS S3 bucket is accessible");
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
  testProductMigration();
}

export { testProductMigration };
