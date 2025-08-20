import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Product } from './entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { Category } from '../category/category.entity';
import { MediaFile } from '../media/media-file.entity';
import { Seller } from '../seller/entities/seller.entity';
import { User } from '../user/user.entity';
import { SellerService } from '../seller/seller.service';
import { productController } from './product.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { upload } from '../../common/middlewares/upload.middleware';
import { globalFormDataBoolean } from '../../common/middlewares/global-formdata-boolean';

const router = Router();

// Initialize repositories and services
const productRepository = AppDataSource.getRepository(Product);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const categoryRepository = AppDataSource.getRepository(Category);
const mediaRepository = AppDataSource.getRepository(MediaFile);
const sellerRepository = AppDataSource.getRepository(Seller);
const userRepository = AppDataSource.getRepository(User);

// Initialize seller service
const sellerService = new SellerService(
  sellerRepository,
  userRepository,
  productRepository,
  AppDataSource
);

// Initialize controller with seller service
const ctrl = productController(
  productRepository, 
  attributeRepository, 
  attributeValueRepository, 
  categoryRepository, 
  mediaRepository, 
  sellerRepository,
  sellerService
);

/**
 * @swagger
 * /api/v1/products/store:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with images and attributes
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductDto'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/store', 
  authenticate, 
  upload.fields([
    { name: 'thumbnailImg', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]), 
  globalFormDataBoolean, 
  validateDto(CreateProductDto), 
  ctrl.createProduct
);

/**
 * @swagger
 * /api/v1/products/all:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products with pagination and filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering products
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         description: Filter by seller ID
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get('/all', ctrl.getProducts);

/**
 * @swagger
 * /api/v1/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve products filtered by specific category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID to filter products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/category/:categoryId', ctrl.getProductsByCategory);

/**
 * @swagger
 * /api/v1/products/seller/{sellerId}:
 *   get:
 *     summary: Get products by seller
 *     description: Retrieve products filtered by specific seller
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID to filter products
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Seller not found
 */
router.get('/seller/:sellerId', ctrl.getProductsBySeller);

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     description: Retrieve a product using its URL slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product URL slug
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', ctrl.getProductBySlug);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a product using its unique ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', ctrl.getProduct);

/**
 * @swagger
 * /api/v1/products/update/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product with new data and images
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductDto'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Product not found
 */
router.put('/update/:id', 
  authenticate, 
  upload.fields([
    { name: 'thumbnailImg', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]), 
  globalFormDataBoolean, 
  validateDto(UpdateProductDto), 
  ctrl.updateProduct
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Permanently delete a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product unique identifier
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authenticate, ctrl.deleteProduct);

export default router; 