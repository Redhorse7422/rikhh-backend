# API Documentation Guide - Minimal Code Changes

This guide shows you how to generate comprehensive API documentation for both **Swagger/OpenAPI** and **Postman** with minimal changes to your existing code.

## 🚀 What You Get

- **Swagger UI**: Interactive API documentation at `/api-docs`
- **OpenAPI JSON**: Machine-readable spec at `/api-docs.json`
- **Postman Collection**: Auto-generated collection for easy testing
- **Zero Breaking Changes**: All existing code continues to work

## 📋 Prerequisites

You already have everything installed:
- ✅ `swagger-ui-express`
- ✅ `swagger-jsdoc`
- ✅ Swagger configuration in `src/docs/sawgger.ts`

## 🎯 How It Works

### 1. **Swagger Documentation (Already Working!)**

Your Swagger is already configured and working! Just add JSDoc comments above your routes.

**Example - Before:**
```typescript
// Create referral code
router.post("/codes", authenticate, validateDto(CreateReferralCodeDto), ctrl.createReferralCode);
```

**Example - After:**
```typescript
/**
 * @swagger
 * /api/v1/referrals/codes:
 *   post:
 *     summary: Create a new referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReferralCodeDto'
 *     responses:
 *       201:
 *         description: Referral code created successfully
 *       400:
 *         description: Bad request
 */
router.post("/codes", authenticate, validateDto(CreateReferralCodeDto), ctrl.createReferralCode);
```

### 2. **Schema Definitions**

Add schema definitions to your DTOs:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReferralCodeDto:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user creating the referral code
 *         type:
 *           $ref: '#/components/schemas/REFERRAL_TYPE'
 */
export class CreateReferralCodeDto {
  @IsString()
  userId: string;
  // ... rest of your DTO
}
```

## 🛠️ Quick Setup Steps

### Step 1: Start Your Server
```bash
yarn dev
```

### Step 2: View Swagger Documentation
Open your browser and go to:
```
http://localhost:3000/api-docs
```

### Step 3: Generate Postman Collection
```bash
yarn docs:postman
```

This will create `postman-collection.json` in your project root.

## 📚 Available Documentation

### Swagger UI Features
- **Interactive Testing**: Test APIs directly from the browser
- **Request/Response Examples**: See expected data formats
- **Authentication**: JWT Bearer token support
- **Schema Validation**: View all DTO structures
- **API Explorer**: Easy navigation between endpoints

### Postman Collection Features
- **Auto-generated**: Based on your Swagger docs
- **Environment Variables**: `{{baseUrl}}` and `{{token}}` support
- **Request Templates**: Pre-filled with correct headers and methods
- **Easy Import**: One-click import into Postman

## 🔧 Adding Documentation to New Routes

### For Routes
```typescript
/**
 * @swagger
 * /api/v1/your-endpoint:
 *   get:
 *     summary: Brief description
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 */
router.get('/your-endpoint/:id', middleware, controller);
```

### For DTOs
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     YourDto:
 *       type: object
 *       required:
 *         - field1
 *       properties:
 *         field1:
 *           type: string
 *           description: Description of field1
 */
export class YourDto {
  @IsString()
  field1: string;
}
```

## 🌟 Best Practices

### 1. **Keep It Simple**
- Start with basic summaries
- Add details gradually
- Focus on essential information

### 2. **Use Tags**
- Group related endpoints: `tags: [Users]`, `tags: [Products]`
- Makes documentation easier to navigate

### 3. **Consistent Formatting**
- Use the same structure for all endpoints
- Include security requirements
- Document all response codes

### 4. **Schema References**
- Reference DTOs: `$ref: '#/components/schemas/YourDto'`
- Avoid duplicating schema definitions

## 🚀 Advanced Features

### Custom Swagger Configuration
Your `sawgger.ts` already includes:
- JWT authentication support
- Multiple server environments
- Custom styling
- API explorer

### Environment Variables
Postman collection includes:
- `{{baseUrl}}` - Your API base URL
- `{{token}}` - JWT authentication token

## 📖 Example: Complete Route Documentation

```typescript
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed information about a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User's unique identifier
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *           enum: [profile, orders, preferences]
 *         description: Related data to include
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/:id', authenticate, userController.getUserById);
```

## 🎉 Benefits

1. **Zero Breaking Changes**: All existing code works unchanged
2. **Auto-sync**: Documentation always matches your actual API
3. **Team Collaboration**: Developers can easily understand and test APIs
4. **Client Integration**: Frontend teams get clear API specifications
5. **Testing**: QA teams can test APIs directly from documentation

## 🔍 Troubleshooting

### Swagger Not Loading?
- Check if server is running
- Verify `/api-docs` route is accessible
- Check browser console for errors

### Postman Collection Empty?
- Ensure server is running on port 3000
- Check if `/api-docs.json` returns data
- Verify Swagger documentation is complete

### Missing Schemas?
- Add JSDoc comments to your DTOs
- Check for syntax errors in JSDoc
- Restart server after changes

## 📚 Additional Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Postman Collection Format](https://learning.postman.com/docs/collections/collections-overview/)

---

**🎯 Goal**: Document your entire API with minimal code changes while maintaining full functionality.

**💡 Tip**: Start with one module (like referrals) to see the results, then gradually add documentation to other modules.
