# 🚀 Category Migration Quick Start Guide

This guide will help you migrate categories from Firebase products to PostgreSQL using the new category migration script.

## 🎯 What It Does

The category migration script:
1. **Fetches all products** from Firebase `products` collection group
2. **Extracts unique category names** from the `category` field
3. **Creates category records** in PostgreSQL without duplicates
4. **Generates proper slugs** for each category (e.g., "Book Sellers (New and Second Hand)" → "book-sellers-new-and-second-hand")
5. **Reports detailed statistics** of the migration process

## ⚡ Quick Start

### 1. Test Your Setup First

Before running the actual migration, test your connections:

```bash
yarn ts-node src/scripts/test-category-migration.ts
```

This will:
- ✅ Test Firebase connection
- ✅ Test PostgreSQL connection  
- ✅ Show sample categories from Firebase
- ✅ Verify database structure

### 2. Run the Category Migration

```bash
yarn ts-node src/scripts/migrate-categories.ts
```

### 3. View Help and Options

```bash
yarn ts-node src/scripts/migrate-categories.ts --help
```

## 🔧 Prerequisites

### Environment Variables

Make sure your `.env` file has these Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Database Setup

Ensure your PostgreSQL database is running and accessible with the credentials in your `.env` file.

## 📊 Expected Output

When you run the migration, you'll see output like this:

```
🚀 Starting Category Migration from Firebase Products to PostgreSQL...

✅ PostgreSQL connection established
✅ Redis connection established
✅ Firebase connection ready

📊 Found 25 unique categories to migrate

🔄 Processing category: Book Sellers (New and Second Hand)
✅ Successfully migrated category: Book Sellers (New and Second Hand)

🔄 Processing category: Electronics
✅ Successfully migrated category: Electronics

...

📊 ===== CATEGORY MIGRATION REPORT =====
Total unique categories found: 25
Successfully migrated: 25
Skipped (already exist): 0
Errors: 0

🎯 Category migration completed!

💡 Next steps:
  1. Verify categories in PostgreSQL
  2. Update category relationships if needed
  3. Run product migration with category references
```

## 🔍 What Happens During Migration

### 1. **Data Extraction**
- Queries Firebase using `collectionGroup("products")` to get all products
- Extracts the `category` field from each product
- Removes duplicates and sorts alphabetically

### 2. **Data Transformation**
- Trims whitespace from category names
- Generates URL-friendly slugs
- Sets default values for optional fields

### 3. **Database Insertion**
- Checks for existing categories (by name or slug)
- Skips duplicates automatically
- Creates new category records with proper relationships

### 4. **Error Handling**
- Continues migration even if individual categories fail
- Reports all errors with details
- Provides comprehensive statistics

## 🚨 Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Verify service account credentials
   - Check project ID and database URL
   - Ensure Firebase Admin SDK is installed

2. **Database Connection Failed**
   - Verify PostgreSQL connection details
   - Check database exists and is accessible
   - Verify user permissions

3. **No Categories Found**
   - Check if products have `category` field
   - Verify Firebase collection structure
   - Check if `category` field contains string values

### Debug Mode

For detailed logging, you can modify the script to add more console.log statements or run with verbose output.

## 📈 After Migration

### 1. **Verify Data**
```sql
-- Check migrated categories
SELECT id, name, slug, description FROM categories;

-- Verify slug uniqueness
SELECT slug, COUNT(*) FROM categories GROUP BY slug HAVING COUNT(*) > 1;
```

### 2. **Update Relationships**
- Set `isParent`, `isFeatured`, `isPopular` flags as needed
- Update category descriptions
- Add thumbnail/cover images

### 3. **Next Steps**
- Run product migration (categories will be referenced by ID)
- Update application code to use PostgreSQL categories
- Remove Firebase category dependencies

## 🔄 Integration with Full Migration

The category migration is integrated with the main Firebase migration script:

```bash
# Run complete migration (including categories)
yarn ts-node src/scripts/firebase-migration.ts

# Or run categories separately first
yarn ts-node src/scripts/migrate-categories.ts
yarn ts-node src/scripts/firebase-migration.ts
```

## 💡 Best Practices

1. **Test First**: Always run the test script before migration
2. **Backup Database**: Create a backup before running migrations
3. **Small Batches**: For large datasets, consider processing in smaller batches
4. **Monitor Progress**: Watch the console output for any issues
5. **Verify Results**: Check the migration report and verify data integrity

## 🆘 Getting Help

If you encounter issues:

1. Check the error logs for specific failure details
2. Verify your environment configuration
3. Test with a small subset of data first
4. Review the migration script for any customizations needed

---

**Happy Migrating! 🎉**

The category migration is designed to be safe, efficient, and informative. It will only create new categories and skip existing ones, so you can run it multiple times if needed.
