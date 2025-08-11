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

interface FirebaseSeller {
  id: string;
  userId?: string | null;
  businessName?: string;
  businessDescription?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessWebsite?: string;
  businessAddress?: string;
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

class SellerMigrationTester {
  private testUserId: string | null = null;

  /**
   * Test seller migration with sample data
   */
  async testSellerMigration(): Promise<void> {
    console.log("🧪 Testing Seller Migration with Sample Data...\n");

    try {
      // Initialize connections
      await this.initializeConnections();

      // Create a test user first
      await this.createTestUser();

      // Test with sample Firebase data
      const sampleSellers = this.generateSampleSellers();

      console.log(`📊 Testing with ${sampleSellers.length} sample sellers\n`);

      // Test data transformation
      for (const sampleSeller of sampleSellers) {
        await this.testSellerTransformation(sampleSeller);
      }

      // Test database insertion
      await this.testDatabaseInsertion(sampleSellers);

      console.log("\n🎉 All tests completed successfully!");
    } catch (error) {
      console.error("❌ Test failed:", error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Create a test user for testing seller relationships
   */
  private async createTestUser(): Promise<void> {
    try {
      console.log("👤 Creating test user for seller testing...");
      
      const userRepository = AppDataSource.getRepository(User);
      
      // Check if test user already exists
      const existingUser = await userRepository.findOne({
        where: { email: "test-seller-user@example.com" }
      });
      
      if (existingUser) {
        this.testUserId = existingUser.id;
        console.log(`✅ Using existing test user: ${this.testUserId}`);
        return;
      }
      
      // Create test user
      const testUser = userRepository.create({
        documentId: "test_user_1", // Add documentId for testing
        email: "test-seller-user@example.com",
        password: "testpassword123", // Will be hashed by entity hooks
        firstName: "Test",
        lastName: "SellerUser",
        phone: "+1234567890",
        type: "SELLER" as any, // Use 'type' instead of 'userType'
        isActive: true,
        emailVerified: true, // Use 'emailVerified' instead of 'isVerified'
      });
      
      const savedUser = await userRepository.save(testUser);
      this.testUserId = savedUser.id;
      
      console.log(`✅ Created test user: ${this.testUserId}`);
      
    } catch (error: any) {
      console.error("❌ Failed to create test user:", error.message);
      throw error;
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

      // Test Firebase connection
      try {
        const db = getFirestore();
        console.log("✅ Firebase connection established");
      } catch (firebaseError: any) {
        console.log(
          "⚠️ Firebase connection failed (continuing with tests):",
          firebaseError.message
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to initialize connections: ${error.message}`);
    }
  }

  /**
   * Generate sample Firebase seller data for testing
   */
  private generateSampleSellers(): FirebaseSeller[] {
    return [
      {
        id: "test_seller_1",
        userId: this.testUserId, // Use the test user ID
        businessName: "Test Electronics Store",
        businessDescription: "A test electronics store for migration testing",
        businessPhone: "+1234567890",
        businessEmail: "test@electronics.com",
        businessWebsite: "https://testelectronics.com",
        businessAddress: "123 Test Street",
        businessCity: "Test City",
        businessState: "Test State",
        businessPostalCode: "12345",
        businessCountry: "Test Country",
        taxId: "TAX123456",
        licenseNumber: "LIC789012",
        licenseExpiryDate: new Date("2025-12-31"),
        status: "approved",
        verificationStatus: "verified",
        verificationDocuments: "doc1.pdf,doc2.pdf",
        profileImage: "profile1.jpg",
        bannerImage: "banner1.jpg",
        totalProducts: 150,
        totalSales: 50000,
        totalOrders: 200,
        totalRevenue: 75000,
        rating: 4.5,
        reviewCount: 45,
        commissionRate: 5.0,
        payoutMethod: "bank_transfer",
        payoutDetails: '{"bank": "Test Bank", "account": "123456789"}',
        approvedAt: new Date("2024-01-15"),
        approvedBy: "admin_user",
        notes: "Test seller for migration",
        fcmToken: "test_fcm_token_1",
        referralCode: "TEST001",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "test_seller_2",
        userId: this.testUserId, // Use the test user ID
        businessName: "Test Fashion Boutique",
        businessDescription: "A test fashion boutique for migration testing",
        businessPhone: "+0987654321",
        businessEmail: "test@fashion.com",
        businessWebsite: "https://testfashion.com",
        businessAddress: "456 Fashion Ave",
        businessCity: "Fashion City",
        businessState: "Fashion State",
        businessPostalCode: "54321",
        businessCountry: "Fashion Country",
        taxId: "TAX654321",
        licenseNumber: "LIC210987",
        licenseExpiryDate: new Date("2026-06-30"),
        status: "pending",
        verificationStatus: "pending",
        verificationDocuments: "fashion_doc1.pdf",
        profileImage: "profile2.jpg",
        bannerImage: "banner2.jpg",
        totalProducts: 75,
        totalSales: 25000,
        totalOrders: 100,
        totalRevenue: 35000,
        rating: 4.2,
        reviewCount: 28,
        commissionRate: 4.5,
        payoutMethod: "paypal",
        payoutDetails: '{"paypal": "test@fashion.com"}',
        approvedAt: null,
        notes: "Test fashion seller",
        fcmToken: "test_fcm_token_2",
        referralCode: "TEST002",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
    ];
  }

  /**
   * Test seller data transformation
   */
  private async testSellerTransformation(
    firebaseSeller: FirebaseSeller
  ): Promise<void> {
    try {
      console.log(`🔄 Testing transformation for seller: ${firebaseSeller.id}`);

      // Transform the data
      const transformedData = this.transformSellerData(firebaseSeller);

      // Validate required fields
      if (!transformedData.documentId) {
        throw new Error("documentId is missing");
      }

      if (!transformedData.businessName) {
        throw new Error("businessName is missing");
      }

      if (!transformedData.userId) {
        throw new Error("userId is missing");
      }

      // Validate enum mappings
      if (
        !Object.values(SELLER_STATUS).includes(
          transformedData.status || SELLER_STATUS.PENDING
        )
      ) {
        throw new Error(`Invalid status: ${transformedData.status}`);
      }

      if (
        !Object.values(SELLER_VERIFICATION_STATUS).includes(
          transformedData.verificationStatus ||
            SELLER_VERIFICATION_STATUS.UNVERIFIED
        )
      ) {
        throw new Error(
          `Invalid verificationStatus: ${transformedData.verificationStatus}`
        );
      }

      console.log(`✅ Transformation successful for ${firebaseSeller.id}`);
      console.log(`   - Status: ${transformedData.status}`);
      console.log(`   - Verification: ${transformedData.verificationStatus}`);
      console.log(`   - Business: ${transformedData.businessName}`);
      console.log(`   - User ID: ${transformedData.userId}`);
    } catch (error: any) {
      console.error(
        `❌ Transformation failed for ${firebaseSeller.id}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Test database insertion
   */
  private async testDatabaseInsertion(
    sampleSellers: FirebaseSeller[]
  ): Promise<void> {
    try {
      console.log("\n🔄 Testing database insertion...");

      const sellerRepository = AppDataSource.getRepository(Seller);

      // Test inserting the first seller
      const testSeller = sampleSellers[0];
      const transformedData = this.transformSellerData(testSeller);

      // Check if seller already exists
      const existingSeller = await sellerRepository.findOne({
        where: { documentId: testSeller.id },
      });

      if (existingSeller) {
        console.log(
          `⏭️ Test seller ${testSeller.id} already exists, skipping insertion test`
        );
        return;
      }

      // Create and save seller
      const seller = sellerRepository.create(transformedData);
      const savedSeller = await sellerRepository.save(seller);

      console.log(`✅ Database insertion successful for ${testSeller.id}`);
      console.log(`   - PostgreSQL ID: ${savedSeller.id}`);
      console.log(`   - Document ID: ${savedSeller.documentId}`);
      console.log(`   - User ID: ${savedSeller.userId}`);

      // Clean up test data
      await sellerRepository.remove(savedSeller);
      console.log(`🧹 Test seller ${testSeller.id} removed from database`);
    } catch (error: any) {
      console.error("❌ Database insertion test failed:", error.message);
      throw error;
    }
  }

  /**
   * Transform Firebase seller data to PostgreSQL format
   */
  private transformSellerData(firebaseSeller: FirebaseSeller): Partial<Seller> {
    return {
      documentId: firebaseSeller.id,
      userId: firebaseSeller.userId || "", // Use the test user ID
      businessName: firebaseSeller.businessName || "",
      businessDescription: firebaseSeller.businessDescription || "",
      businessPhone: firebaseSeller.businessPhone || "",
      businessEmail: firebaseSeller.businessEmail || "",
      businessWebsite: firebaseSeller.businessWebsite || "",
      businessAddress: firebaseSeller.businessAddress || "",
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
   * Cleanup connections and test data
   */
  private async cleanup(): Promise<void> {
    try {
      // Clean up test user if we created one
      if (this.testUserId) {
        try {
          const userRepository = AppDataSource.getRepository(User);
          const testUser = await userRepository.findOne({
            where: { id: this.testUserId }
          });
          
          if (testUser && testUser.email === "test-seller-user@example.com") {
            await userRepository.remove(testUser);
            console.log("🧹 Test user removed from database");
          }
        } catch (error) {
          console.warn("⚠️ Warning during test user cleanup:", error);
        }
      }

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
  const tester = new SellerMigrationTester();

  try {
    await tester.testSellerMigration();
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SellerMigrationTester };
