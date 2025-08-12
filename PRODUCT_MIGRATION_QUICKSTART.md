# 🚀 Product Migration Quick Start Guide

This guide will help you migrate products from Firebase to PostgreSQL, including:
- **Product data migration** from Firebase to PostgreSQL
- **Image download** from Firebase Storage URLs
- **AWS S3 upload** of product images
- **Media file records** creation in PostgreSQL
- **Category linking** using existing category IDs
- **Seller linking** using existing seller IDs

## ⚡ Quick Start

### 1. Test Your Setup First

Before running the actual migration, test your connections and see sample data:

```bash
yarn ts-node src/scripts/test-product-migration.ts
```

This will:
- ✅ Test Firebase connection
- ✅ Test PostgreSQL connection  
- ✅ Test AWS S3 connection
- ✅ Show sample products from Firebase
- ✅ Verify database structure
- ✅ Check existing categories and sellers

### 2. Test with 2 Products First

Start with a small test to verify everything works:

```bash
yarn ts-node src/scripts/migrate-products.ts --test
```

This will:
- Process only 2 products
- Download and upload images to S3
- Create media file records
- Link categories and sellers
- Provide detailed feedback

### 3. Run Full Product Migration

Once testing is successful, run the complete migration:

```bash
yarn ts-node src/scripts/migrate-products.ts
```

### 4. View Help and Options

```bash
yarn ts-node src/scripts/migrate-products.ts --help
```

## 🔧 Prerequisites

### Environment Variables

Make sure your `.env` file has these credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=your-database

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

### Required Dependencies

Make sure you have these packages installed:

```bash
yarn add axios
yarn add @aws-sdk/client-s3
yarn add @aws-sdk/s3-request-presigner
```

## 📊 Expected Output

When you run the migration, you'll see output like this:

```
🚀 Starting Product Migration from Firebase Products to PostgreSQL...

✅ PostgreSQL connection established
✅ Redis connection established
✅ Firebase connection ready

📊 Found 150 products in Firebase
🔄 Processing 2 products

🔄 Processing product: ArtgHHTSrcoks0cSWJKb
   Name: Agniveer army book only one month very good condition
   Category: Book Sellers (New and Second Hand)
🖼️ Processing 3 images...
📥 Downloading image: https://firebasestor...
☁️ Uploading to S3: product_ArtgHHTSrcoks0cSWJKb_1.jpg
✅ Media file created: 123e4567-e89b-12d3-a456-426614174000
✅ Image 1 processed successfully
✅ Found category: Book Sellers (New and Second Hand)
✅ Successfully migrated product: Agniveer army book only one month very good condition

📊 ===== PRODUCT MIGRATION REPORT =====
Total products processed: 2
Successfully migrated: 2
Skipped (already exist): 0
Errors: 0

🎯 Product migration completed!

💡 Next steps:
  1. Verify products in PostgreSQL
  2. Check media files and S3 uploads
  3. Verify category and seller relationships
  4. Test with more products if everything looks good
```

## 🔍 What Happens During Migration

### 1. **Data Extraction**
- Queries Firebase using `collectionGroup("products")` to get all products
- Extracts product fields: name, description, price, category, images, etc.
- Identifies seller and user relationships

### 2. **Image Processing**
- Downloads images from Firebase Storage URLs using axios
- Generates unique filenames for each product image
- Uploads images to AWS S3 in the "products" folder
- Creates media file records in PostgreSQL

### 3. **Product Creation**
- Generates URL-friendly slugs from product names
- Creates product records with proper field mapping
- Sets up relationships with categories and sellers
- Links media files and sets thumbnail image

### 4. **Relationship Linking**
- Finds categories by name and links them to products
- Finds sellers by document ID and links them to products
- Creates many-to-many relationships for categories
- Sets up media file relationships

### 5. **Error Handling**
- Continues migration even if individual products fail
- Reports all errors with details
- Provides comprehensive statistics
- Handles missing images, categories, or sellers gracefully

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Verify service account credentials
   - Check project ID and database URL
   - Ensure Firebase Admin SDK is properly initialized

2. **Database Connection Failed**
   - Verify PostgreSQL connection details
   - Check database exists and is accessible
   - Verify user permissions

3. **AWS S3 Upload Failed**
   - Check AWS credentials and permissions
   - Verify S3 bucket exists and is accessible
   - Check bucket policy allows uploads

4. **Image Download Failed**
   - Verify Firebase Storage URLs are accessible
   - Check network connectivity
   - Ensure Firebase Storage rules allow access

5. **Category/Seller Not Found**
   - Run category migration first: `yarn ts-node src/scripts/migrate-categories.ts`
   - Run seller migration first: `yarn ts-node src/scripts/migrate-sellers.ts`
   - Check if the referenced categories/sellers exist

### Debug Mode

For detailed logging, you can modify the script to add more console.log statements or check the migration logs.

## 📈 After Migration

### 1. **Verify Data**

```sql
-- Check migrated products
SELECT id, name, slug, shortDescription, regularPrice FROM products;

-- Check media files
SELECT id, fileName, uri, url, size FROM media_files;

-- Check product-category relationships
SELECT p.name, c.name FROM products p 
JOIN product_categories_categories pcc ON p.id = pcc.productsId
JOIN categories c ON c.id = pcc.categoriesId;

-- Check product-seller relationships
SELECT p.name, s.businessName FROM products p 
JOIN sellers s ON p.sellerId = s.id;
```

### 2. **Verify S3 Uploads**
- Check your AWS S3 bucket for uploaded images
- Verify images are accessible via the generated URLs
- Check file sizes and metadata

### 3. **Test Relationships**
- Verify products are properly linked to categories
- Check seller relationships are correct
- Ensure media files are properly associated

## 🔄 Integration with Full Migration

The product migration is integrated with the main Firebase migration script:

```bash
# Run complete migration (including products)
yarn ts-node src/scripts/firebase-migration.ts

# Or run products separately
yarn ts-node src/scripts/migrate-products.ts
```

## 💡 Best Practices

1. **Test First**: Always run the test script before migration
2. **Start Small**: Use `--test` flag to process only 2 products first
3. **Check Dependencies**: Ensure categories and sellers are migrated first
4. **Monitor S3**: Watch for successful image uploads to AWS
5. **Verify Relationships**: Check that categories and sellers are properly linked
6. **Backup Database**: Create a backup before running migrations

## 🆘 Getting Help

If you encounter issues:

1. **Check the test script output** for connection issues
2. **Review error logs** for specific failure details
3. **Verify environment configuration** (Firebase, Database, AWS)
4. **Test with smaller batches** if you have many products
5. **Check S3 bucket permissions** and policies

## 🔧 Customization

### Field Mapping

The script maps these Firebase fields to PostgreSQL:

| Firebase Field | PostgreSQL Field | Notes |
|----------------|------------------|-------|
| `name` | `name` | Product name |
| `description` | `shortDescription`, `longDescription` | Product description |
| `price` | `regularPrice` | Regular price |
| `salePrice` | `salePrice` | Sale price |
| `stock` | `stock` | Available stock |
| `images` | `photos` (MediaFile[]) | Product images |
| `category` | `categories` (Category[]) | Product categories |
| `sellerId` | `sellerId` | Seller reference |
| `rating` | `rating` | Product rating |
| `tags` | `tags` | Product tags |

### Image Processing

- Images are downloaded from Firebase Storage URLs
- Uploaded to S3 in the "products" folder
- Filenames follow pattern: `product_{id}_{index}.jpg`
- Media file records are created with proper metadata

---

**Happy Product Migrating! 🎉**

The product migration is designed to be safe, efficient, and informative. It will only create new products and skip existing ones, so you can run it multiple times if needed.

Start with the test mode to verify everything works, then proceed with the full migration!
