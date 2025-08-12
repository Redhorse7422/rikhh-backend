# Node.js TypeScript Authentication API

A modern Node.js API with TypeScript and user authentication.

## Features

- TypeScript support
- User authentication with JWT
- MongoDB database integration
- Password hashing with bcrypt
- Express.js framework
- CORS enabled
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rikhh
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "user@example.com", "password": "password123" }`

## Project Structure

```
src/
  ├── controllers/    # Route controllers
  ├── models/        # Database models
  ├── routes/        # API routes
  ├── middleware/    # Custom middleware
  └── index.ts       # Application entry point
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Environment variable configuration
- CORS enabled
- Input validation

## Safe Migration for Developers

If you or any developer faces migration errors (especially with tables like media_connect), run the following before running migrations:

```sh
yarn dev:cleanup
```

This will truncate problematic tables (media_connect, media_files, product_categories, categories, products) and ensure a clean state. **WARNING: This deletes all data in those tables. Do not use in production!**

Then run:

```sh
yarn migration:run
```

This guarantees that migrations will run without errors in development.

## Firebase to PostgreSQL Migration

This project includes tools to migrate data from Firebase Firestore to PostgreSQL.

### Available Migration Scripts

- **Categories**: `yarn ts-node src/scripts/migrate-categories.ts`
- **Sellers**: `yarn ts-node src/scripts/migrate-sellers.ts`
- **Products**: `yarn ts-node src/scripts/migrate-products.ts`
- **Full Migration**: `yarn ts-node src/scripts/firebase-migration.ts`

### Quick Start

1. **Test your setup first**:
   ```bash
   yarn ts-node src/scripts/test-category-migration.ts
   ```

2. **Migrate categories from products**:
   ```bash
   yarn ts-node src/scripts/migrate-categories.ts
   ```

3. **Test product migration setup**:
   ```bash
   yarn ts-node src/scripts/test-product-migration.ts
   ```

4. **Test with 2 products first**:
   ```bash
   yarn ts-node src/scripts/migrate-products.ts --test
   ```

5. **View help**:
   ```bash
   yarn ts-node src/scripts/migrate-products.ts --help
   ```

### What the Category Migration Does

1. **Fetches all products** from Firebase `products` collection group
2. **Extracts unique categories** from the `category` field
3. **Creates category records** in PostgreSQL without duplicates
4. **Generates proper slugs** for each category
5. **Reports migration statistics**

### What the Product Migration Does

1. **Fetches all products** from Firebase `products` collection group
2. **Downloads images** from Firebase Storage URLs
3. **Uploads images to AWS S3** and creates media file records
4. **Creates product records** with proper field mapping
5. **Links categories and sellers** using existing IDs
6. **Sets up media file relationships** and thumbnail images
7. **Reports comprehensive migration statistics**

### Environment Variables Required

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=your-database

# AWS S3 Configuration (for product images)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

For complete migration details, see [FIREBASE_MIGRATION_GUIDE.md](FIREBASE_MIGRATION_GUIDE.md).

## License
