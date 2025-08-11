import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { redis } from "../config/redis";
import { getFirestore, closeFirebase } from "../config/firebase.config";

/**
 * Test script to verify migration setup
 * This script tests connections without performing any actual migration
 */
async function testMigrationSetup() {
  console.log("🧪 Testing Migration Setup...\n");

  let postgresConnected = false;
  let redisConnected = false;
  let firebaseConnected = false;

  try {
    // Test PostgreSQL connection
    console.log("📊 Testing PostgreSQL connection...");
    await AppDataSource.initialize();
    console.log("✅ PostgreSQL: Connected successfully");
    postgresConnected = true;

    // Test Redis connection
    console.log("📊 Testing Redis connection...");
    await redis.connect();
    console.log("✅ Redis: Connected successfully");
    redisConnected = true;

    // Test Firebase connection
    console.log("📊 Testing Firebase connection...");
    try {
      const db = getFirestore();
      // Try to get a simple collection to test connection
      const testSnapshot = await db.collection("test").limit(1).get();
      console.log("✅ Firebase: Connected successfully");
      firebaseConnected = true;
    } catch (firebaseError: any) {
      if (
        firebaseError.message.includes(
          "Missing required Firebase configuration"
        )
      ) {
        console.log(
          "⚠️ Firebase: Configuration missing (check environment variables)"
        );
      } else {
        console.log("❌ Firebase: Connection failed -", firebaseError.message);
      }
    }

    // Test database schema
    console.log("\n📊 Testing database schema...");
    const sellerRepository = AppDataSource.getRepository("Seller");
    if (sellerRepository) {
      console.log("✅ Database schema: Seller entity accessible");
    } else {
      console.log("❌ Database schema: Seller entity not found");
    }

    // Test environment variables
    console.log("\n📊 Testing environment variables...");
    const requiredEnvVars = [
      "DB_HOST",
      "DB_PORT",
      "DB_USERNAME",
      "DB_PASSWORD",
      "DB_NAME",
      "FIREBASE_PROJECT_ID",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_CLIENT_EMAIL",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingEnvVars.length === 0) {
      console.log("✅ Environment variables: All required variables present");
    } else {
      console.log(
        "⚠️ Environment variables: Missing variables:",
        missingEnvVars.join(", ")
      );
    }

    // Summary
    console.log("\n📊 ===== SETUP TEST SUMMARY =====");
    console.log(`PostgreSQL: ${postgresConnected ? "✅" : "❌"}`);
    console.log(`Redis: ${redisConnected ? "✅" : "❌"}`);
    console.log(`Firebase: ${firebaseConnected ? "✅" : "⚠️"}`);

    if (postgresConnected && redisConnected) {
      console.log("\n🎉 Basic migration setup is ready!");
      if (firebaseConnected) {
        console.log("🚀 Firebase migration is ready to go!");
      } else {
        console.log("⚠️ Complete Firebase setup to enable migration");
      }
    } else {
      console.log("\n❌ Migration setup has issues that need to be resolved");
    }
  } catch (error: any) {
    console.error("❌ Setup test failed:", error.message);
  } finally {
    // Cleanup
    try {
      if (postgresConnected) {
        await AppDataSource.destroy();
        console.log("🧹 PostgreSQL connection closed");
      }
      if (redisConnected) {
        await redis.disconnect();
        console.log("🧹 Redis connection closed");
      }
      await closeFirebase();
      console.log("🧹 Firebase connection closed");
    } catch (cleanupError: any) {
      console.warn("⚠️ Cleanup warning:", cleanupError.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testMigrationSetup()
    .then(() => {
      console.log("\n🏁 Setup test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup test failed:", error);
      process.exit(1);
    });
}

export { testMigrationSetup };
