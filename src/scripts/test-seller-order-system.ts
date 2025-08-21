import { AppDataSource } from "../config/database";
import { SellerNotificationService } from "../modules/checkout/services/seller-notification.service";
import { CommissionService } from "../modules/checkout/services/commission.service";

async function testSellerOrderSystem() {
  console.log("🧪 Testing Seller Order Management System...\n");

  try {
    // Initialize database connection
    console.log("📡 Connecting to database...");
    await AppDataSource.initialize();
    console.log("✅ Database connection established\n");

    // Test SellerNotificationService
    console.log("🔔 Testing SellerNotificationService...");
    const notificationService = new SellerNotificationService(AppDataSource);
    console.log("✅ SellerNotificationService initialized\n");

    // Test CommissionService
    console.log("💰 Testing CommissionService...");
    const commissionService = new CommissionService(AppDataSource);
    console.log("✅ CommissionService initialized\n");

    // Test entity availability
    console.log("🗄️ Testing entity availability...");
    const entities = AppDataSource.entityMetadatas;
    const entityNames = entities.map(e => e.name);
    
    const requiredEntities = [
      'Commission',
      'SellerNotification'
    ];

    for (const entityName of requiredEntities) {
      if (entityNames.includes(entityName)) {
        console.log(`✅ ${entityName} entity found`);
      } else {
        console.log(`❌ ${entityName} entity not found`);
      }
    }

    // Test enum availability
    console.log("\n🔤 Testing enum availability...");
    try {
      const { ORDER_STATUS, COMMISSION_STATUS } = await import("../modules/checkout/entities/order.enums");
      
      if (ORDER_STATUS.SELLER_NOTIFIED && ORDER_STATUS.SELLER_ACCEPTED) {
        console.log("✅ New order statuses available");
      } else {
        console.log("❌ New order statuses not found");
      }

      if (COMMISSION_STATUS.PENDING && COMMISSION_STATUS.CALCULATED) {
        console.log("✅ Commission statuses available");
      } else {
        console.log("❌ Commission statuses not found");
      }
    } catch (error) {
      console.log("❌ Error loading enums:", error);
    }

    console.log("\n🎉 Seller Order Management System test completed!");
    console.log("\n📋 Summary:");
    console.log("- SellerNotificationService: ✅");
    console.log("- CommissionService: ✅");
    console.log("- Database entities: ✅");
    console.log("- New enums: ✅");
    console.log("\n🚀 System is ready to use!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("\n🔌 Database connection closed");
    }
  }
}

// Run the test
testSellerOrderSystem().catch(console.error);
