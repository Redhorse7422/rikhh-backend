import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { redis } from "../config/redis";
import { getFirestore, closeFirebase } from "../config/firebase.config";
import { Product } from "../modules/products/entities/product.entity";
import { Category } from "../modules/category/category.entity";
import { MediaFile, USER_SCOPE } from "../modules/media/media-file.entity";
import { Seller } from "../modules/seller/entities/seller.entity";
import { s3Service } from "../libs/s3";
import axios from "axios";
import * as admin from "firebase-admin";

interface FirebaseProduct {
  id: string;
  category?: string;
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  images?: string[];
  sellerId?: string;
  userId?: string;
  tags?: string[];
  published?: boolean;
  approved?: boolean;
  featured?: boolean;
  rating?: number;
  numOfSales?: number;
  createdAt?: any;
  updatedAt?: any;
  lat?: string;
  lng?: string;
  [key: string]: any;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorsList: Array<{ id: string; error: string }>;
}

class ProductMigrationService {
  private stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
    errorsList: [],
  };

  private testMode: boolean = false;
  private maxProducts: number = 2; // Start with 2 products for testing

  constructor(testMode: boolean = false) {
    this.testMode = testMode;
    if (testMode) {
      console.log("🧪 TEST MODE: Will only process 2 products");
    }
  }

  /**
   * Main migration method for products
   */
  async migrateProducts(): Promise<void> {
    console.log(
      "🚀 Starting Product Migration from Firebase to PostgreSQL...\n"
    );

    try {
      // Initialize connections
      await this.initializeConnections();

      // Fetch products from Firebase
      const firebaseProducts = await this.fetchProductsFromFirebase();

      if (!firebaseProducts || firebaseProducts.length === 0) {
        console.log("⚠️ No products found in Firebase");
        return;
      }

      // Limit products for testing
      const productsToProcess = this.testMode
        ? firebaseProducts.slice(0, this.maxProducts)
        : firebaseProducts;

      this.stats.total = productsToProcess.length;
      console.log(`📊 Found ${firebaseProducts.length} products in Firebase`);
      console.log(`🔄 Processing ${productsToProcess.length} products\n`);

      // Process each product
      for (const firebaseProduct of productsToProcess) {
        await this.processProduct(firebaseProduct);
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
   * Generate slug from product name
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
   * Download image from Firebase Storage URL
   */
  private async downloadImageFromFirebase(imageUrl: string): Promise<Buffer> {
    try {
      console.log(`📥 Downloading image: ${imageUrl}`);

      // Extract Firebase Storage URL and download
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 30000, // 30 second timeout
      });

      return Buffer.from(response.data);
    } catch (error: any) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Upload image to S3 and create media file record
   */
  private async uploadImageToS3(
    imageBuffer: Buffer,
    originalUrl: string,
    fileName: string,
    mimetype: string
  ): Promise<MediaFile> {
    try {
      console.log(`☁️ Uploading to S3: ${fileName}`);

      // Create a file-like object for S3 upload
      const file = {
        buffer: imageBuffer,
        originalname: fileName,
        mimetype: mimetype,
        size: imageBuffer.length,
      } as any;

      // Upload to S3
      const s3Result = await s3Service.uploadFile(file, "products", fileName);

      // Create media file record
      const mediaFileRepository = AppDataSource.getRepository(MediaFile);
      const mediaFile = mediaFileRepository.create({
        scope: USER_SCOPE.SELLER,
        uri: s3Result.key,
        url: s3Result.url,
        fileName: fileName,
        mimetype: mimetype,
        size: s3Result.size,
      });

      const savedMediaFile = await mediaFileRepository.save(mediaFile);
      console.log(`✅ Media file created: ${savedMediaFile.id}`);

      return savedMediaFile;
    } catch (error: any) {
      throw new Error(`Failed to upload image to S3: ${error.message}`);
    }
  }

  /**
   * Process product images
   */
  private async processProductImages(
    firebaseProduct: FirebaseProduct
  ): Promise<MediaFile[]> {
    const mediaFiles: MediaFile[] = [];

    if (!firebaseProduct.images || firebaseProduct.images.length === 0) {
      console.log("⚠️ No images found for product");
      return mediaFiles;
    }

    console.log(`🖼️ Processing ${firebaseProduct.images.length} images...`);

    for (let i = 0; i < firebaseProduct.images.length; i++) {
      try {
        const imageUrl = firebaseProduct.images[i];
        if (!imageUrl) continue;

        // Generate filename
        const fileName = `product_${firebaseProduct.id}_${i + 1}.jpg`;
        const mimetype = "image/jpeg";

        // Download image from Firebase
        const imageBuffer = await this.downloadImageFromFirebase(imageUrl);

        // Upload to S3 and create media file record
        const mediaFile = await this.uploadImageToS3(
          imageBuffer,
          imageUrl,
          fileName,
          mimetype
        );

        mediaFiles.push(mediaFile);
        console.log(`✅ Image ${i + 1} processed successfully`);
      } catch (error: any) {
        console.error(`❌ Failed to process image ${i + 1}:`, error.message);
        // Continue with other images
      }
    }

    return mediaFiles;
  }

  /**
   * Find category by name
   */
  private async findCategoryByName(
    categoryName: string
  ): Promise<Category | null> {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      return await categoryRepository.findOne({
        where: { name: categoryName },
      });
    } catch (error: any) {
      console.warn(
        `⚠️ Could not find category "${categoryName}":`,
        error.message
      );
      return null;
    }
  }

  /**
   * Find seller by document ID
   */
  private async findSellerByDocumentId(
    documentId: string
  ): Promise<Seller | null> {
    try {
      const sellerRepository = AppDataSource.getRepository(Seller);
      return await sellerRepository.findOne({
        where: { documentId: documentId },
      });
    } catch (error: any) {
      console.warn(
        `⚠️ Could not find seller with documentId "${documentId}":`,
        error.message
      );
      return null;
    }
  }

  /**
   * Process individual product migration
   */
  private async processProduct(
    firebaseProduct: FirebaseProduct
  ): Promise<void> {
    try {
      console.log(`🔄 Processing product: ${firebaseProduct.id}`);
      console.log(`   Name: ${firebaseProduct.name || "N/A"}`);
      console.log(`   Category: ${firebaseProduct.category || "N/A"}`);

      const productRepository = AppDataSource.getRepository(Product);

      // Check if product already exists
      const existingProduct = await productRepository.findOne({
        where: { slug: this.slugify(firebaseProduct.name || "") },
      });

      if (existingProduct) {
        console.log(
          `⏭️ Product "${firebaseProduct.name}" already exists, skipping...`
        );
        this.stats.skipped++;
        return;
      }

      // Process images first
      const mediaFiles = await this.processProductImages(firebaseProduct);

      // Find category
      let category: Category | null = null;
      if (firebaseProduct.category) {
        category = await this.findCategoryByName(firebaseProduct.category);
        if (category) {
          console.log(`✅ Found category: ${category.name}`);
        } else {
          console.log(`⚠️ Category not found: ${firebaseProduct.category}`);
        }
      }

      // Find seller
      let seller: Seller | null = null;
      if (firebaseProduct.sellerId) {
        seller = await this.findSellerByDocumentId(firebaseProduct.sellerId);
        if (seller) {
          console.log(`✅ Found seller: ${seller.businessName}`);
        } else {
          console.log(`⚠️ Seller not found: ${firebaseProduct.sellerId}`);
        }
      }

      // Create product data
      const productData = {
        name: firebaseProduct.name || `Product ${firebaseProduct.id}`,
        slug: this.slugify(
          firebaseProduct.name || `Product ${firebaseProduct.id}`
        ),
        shortDescription: firebaseProduct.description || "",
        longDescription: firebaseProduct.description || "",
        regularPrice: firebaseProduct.price || 0,
        salePrice: firebaseProduct.salePrice || firebaseProduct.price || 0,
        stock: firebaseProduct.stock || 0,
        published: firebaseProduct.published || false,
        approved: firebaseProduct.approved || false,
        featured: firebaseProduct.featured || false,
        rating: firebaseProduct.rating || 0,
        numOfSales: firebaseProduct.numOfSales || 0,
        tags: firebaseProduct.tags || [],
        sellerId: seller?.id || undefined,
        userId: firebaseProduct.userId || undefined,
        lat: firebaseProduct.lat,
        lng: firebaseProduct.lng,
        // Set thumbnail if we have images
        thumbnailImgId: mediaFiles.length > 0 ? mediaFiles[0].id : undefined,
      };

      // Create and save product
      const product = productRepository.create(productData);
      const savedProduct = await productRepository.save(product);

      // Set up relationships
      if (category) {
        savedProduct.categories = [category];
      }

      if (mediaFiles.length > 0) {
        savedProduct.photos = mediaFiles;
      }

      // Save with relationships
      await productRepository.save(savedProduct);

      console.log(`✅ Successfully migrated product: ${firebaseProduct.name}`);
      this.stats.migrated++;
    } catch (error: any) {
      console.error(
        `❌ Failed to migrate product ${firebaseProduct.id}:`,
        error.message
      );
      this.stats.errors++;
      this.stats.errorsList.push({
        id: firebaseProduct.id,
        error: error.message,
      });
    }
  }

  /**
   * Generate migration report
   */
  private generateReport(): void {
    console.log("\n📊 ===== PRODUCT MIGRATION REPORT =====");
    console.log(`Total products processed: ${this.stats.total}`);
    console.log(`Successfully migrated: ${this.stats.migrated}`);
    console.log(`Skipped (already exist): ${this.stats.skipped}`);
    console.log(`Errors: ${this.stats.errors}`);

    if (this.stats.errors > 0) {
      console.log("\n❌ Errors encountered:");
      this.stats.errorsList.forEach((error) => {
        console.log(`  - ${error.id}: ${error.error}`);
      });
    }

    console.log("\n🎯 Product migration completed!");
    console.log("\n💡 Next steps:");
    console.log("  1. Verify products in PostgreSQL");
    console.log("  2. Check media files and S3 uploads");
    console.log("  3. Verify category and seller relationships");
    console.log("  4. Test with more products if everything looks good");
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
🚀 Product Migration Tool

This tool migrates products from Firebase to PostgreSQL, uploads images to AWS S3, and links categories.

Usage: yarn ts-node src/scripts/migrate-products.ts [options]

Options:
  --help, -h     Show this help message
  --test         Test mode - only process 2 products
  --verbose      Show detailed logging

Environment Variables Required:
  FIREBASE_PROJECT_ID
  FIREBASE_PRIVATE_KEY
  FIREBASE_CLIENT_EMAIL
  FIREBASE_DATABASE_URL (optional)
  
  DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
  REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (optional)
  
  AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET

What it does:
  1. Fetches products from Firebase products collection group
  2. Downloads images from Firebase Storage URLs
  3. Uploads images to AWS S3
  4. Creates media file records in PostgreSQL
  5. Creates product records with proper relationships
  6. Links categories and sellers
  7. Reports migration statistics
    `);
    return;
  }

  const testMode = args.includes("--test");
  const migrationService = new ProductMigrationService(testMode);

  try {
    await migrationService.migrateProducts();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ProductMigrationService };
