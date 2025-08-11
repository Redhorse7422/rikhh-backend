# 🚀 Seller Migration Quick Start Guide

This guide will help you test and run the seller migration from Firebase to PostgreSQL.

## 📋 Prerequisites

1. **PostgreSQL Database**: Running and accessible
2. **Redis**: Running and accessible  
3. **Environment Variables**: Configured in `.env` file
4. **Dependencies**: Installed

## 🔧 Setup Steps

### 1. Install Dependencies
```bash
# Install Firebase Admin SDK
yarn add firebase-admin

# Install types for Firebase Admin
yarn add -D @types/firebase-admin
```

### 2. Configure Environment
```bash
# Copy environment template
cp env.template .env

# Edit .env file and add your Firebase credentials:
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the values to your `.env` file

## 🧪 Testing Steps

### Step 1: Test Basic Setup
```bash
# Test database and Redis connections
yarn test:migration
```

**Expected Output:**
```
🧪 Testing Migration Setup...

📊 Testing PostgreSQL connection...
✅ PostgreSQL: Connected successfully

📊 Testing Redis connection...
✅ Redis: Connected successfully

📊 Testing Firebase connection...
✅ Firebase: Connected successfully

🎉 Basic migration setup is ready!
🚀 Firebase migration is ready to go!
```

### Step 2: Test Seller Migration Logic
```bash
# Test seller migration with sample data (no Firebase required)
yarn test:seller
```

**Expected Output:**
```
🧪 Testing Seller Migration with Sample Data...

📊 Testing with 2 sample sellers

🔄 Testing transformation for seller: test_seller_1
✅ Transformation successful for test_seller_1
   - Status: approved
   - Verification: verified
   - Business: Test Electronics Store

🔄 Testing transformation for seller: test_seller_2
✅ Transformation successful for test_seller_2
   - Status: pending
   - Verification: pending
   - Business: Test Fashion Boutique

🔄 Testing database insertion...
✅ Database insertion successful for test_seller_1
   - PostgreSQL ID: [UUID]
   - Document ID: test_seller_1
🧹 Test seller test_seller_1 removed from database

🎉 All tests completed successfully!
```

### Step 3: Test Firebase Connection
```bash
# Test actual Firebase connection
yarn test:migration
```

If Firebase is properly configured, you should see:
```
✅ Firebase: Connected successfully
```

If not, you'll see:
```
⚠️ Firebase: Configuration missing (check environment variables)
```

## 🚀 Running the Actual Migration

### Option 1: Dry Run (Recommended First)
```bash
# See what would be migrated without making changes
yarn migrate:sellers --dry-run
```

### Option 2: Full Migration
```bash
# Run the actual migration
yarn migrate:sellers
```

## 📊 What the Migration Does

1. **Connects to Firebase** and fetches all sellers
2. **Transforms data** from Firebase format to PostgreSQL format
3. **Preserves Firebase IDs** in the `documentId` field
4. **Generates new UUIDs** for PostgreSQL primary keys
5. **Maps enums** (status, verificationStatus)
6. **Handles dates** (Firebase Timestamps → PostgreSQL dates)
7. **Skips duplicates** if sellers already exist
8. **Reports progress** with detailed logging

## 🔍 Data Mapping

| Firebase Field | PostgreSQL Field | Notes |
|----------------|------------------|-------|
| `id` | `documentId` | Firebase ID preserved |
| `businessName` | `businessName` | Business name |
| `status` | `status` | Mapped to enum |
| `verificationStatus` | `verificationStatus` | Mapped to enum |
| `createdAt` | `createdAt` | Auto-generated |
| `updatedAt` | `updatedAt` | Auto-generated |

## ⚠️ Troubleshooting

### Common Issues

1. **Firebase Connection Failed**
   - Check service account credentials
   - Verify project ID and database URL
   - Ensure private key is properly formatted

2. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection details in `.env`
   - Check database exists and is accessible

3. **Type Errors**
   - Ensure all required fields are present
   - Check enum value mappings
   - Verify date format parsing

### Debug Mode
```bash
# Enable detailed logging
yarn migrate:sellers --debug
```

## 📈 Next Steps

After successful seller migration:

1. **Verify Data**: Check PostgreSQL for migrated sellers
2. **Test Relationships**: Ensure user-seller relationships work
3. **Update Code**: Remove Firebase dependencies from seller code
4. **Plan Next Entity**: Choose next entity to migrate (Users recommended)

## 🎯 Success Criteria

Migration is successful when:
- ✅ All sellers are migrated to PostgreSQL
- ✅ Firebase IDs are preserved in `documentId` field
- ✅ New UUIDs are generated for primary keys
- ✅ All data relationships are maintained
- ✅ No duplicate records exist
- ✅ Error count is 0

---

**Ready to migrate? Start with `yarn test:migration` to verify your setup! 🚀**
