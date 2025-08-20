import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Seller } from './entities/seller.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/entities/product.entity';
import { sellerController } from './seller.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { GetSellersQueryDto } from './dto/get-sellers-query.dto';
// import { authenticate } from '../auth/middlewares/auth.middleware';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { USER_TYPE } from '../../constants/user';

const router = Router();

// Initialize repositories
const sellerRepository = AppDataSource.getRepository(Seller);
const userRepository = AppDataSource.getRepository(User);
const productRepository = AppDataSource.getRepository(Product);

// Initialize controller
const controller = sellerController(sellerRepository, userRepository, productRepository);

/**
 * @swagger
 * /api/v1/sellers:
 *   post:
 *     summary: Create a new seller
 *     description: Register a new seller account
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSellerDto'
 *     responses:
 *       201:
 *         description: Seller created successfully
 *       400:
 *         description: Validation error or invalid data
 *       409:
 *         description: Seller already exists
 */
router.post('/', validateDto(CreateSellerDto), controller.createSeller);

/**
 * @swagger
 * /api/v1/sellers:
 *   get:
 *     summary: Get all sellers
 *     description: Retrieve a list of all sellers with pagination and filtering
 *     tags: [Sellers]
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
 *         description: Search term for filtering sellers
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by seller status
 *     responses:
 *       200:
 *         description: Sellers retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', validateDto(GetSellersQueryDto, 'query'), controller.getSellers);

/**
 * @swagger
 * /api/v1/sellers/{id}:
 *   get:
 *     summary: Get seller by ID
 *     description: Retrieve a specific seller by their ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller retrieved successfully
 *       404:
 *         description: Seller not found
 */
router.get('/:id', controller.getSellerById);

/**
 * @swagger
 * /api/v1/sellers/user/{userId}:
 *   get:
 *     summary: Get seller by user ID
 *     description: Retrieve seller information using the associated user ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User unique identifier
 *     responses:
 *       200:
 *         description: Seller retrieved successfully
 *       404:
 *         description: Seller not found
 */
router.get('/user/:userId', controller.getSellerByUserId);

// Protected routes - require authentication
// router.use(authenticate);

/**
 * @swagger
 * /api/v1/sellers/profile/me:
 *   get:
 *     summary: Get my seller profile
 *     description: Retrieve the authenticated seller's own profile
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Seller profile not found
 */
router.get('/profile/me', controller.getSellerByUserId);

/**
 * @swagger
 * /api/v1/sellers/profile/me:
 *   put:
 *     summary: Update my seller profile
 *     description: Update the authenticated seller's own profile
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSellerDto'
 *     responses:
 *       200:
 *         description: Seller profile updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Seller profile not found
 */
router.put('/profile/me', validateDto(UpdateSellerDto), controller.updateSeller);

/**
 * @swagger
 * /api/v1/sellers/profile/me/stats:
 *   get:
 *     summary: Get my seller statistics
 *     description: Retrieve statistics for the authenticated seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Seller profile not found
 */
router.get('/profile/me/stats', controller.getSellerStats);

// Admin routes - require admin role
/**
 * @swagger
 * /api/v1/sellers/{id}:
 *   put:
 *     summary: Update seller (admin)
 *     description: Update a seller account (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSellerDto'
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.put('/:id', validateDto(UpdateSellerDto), controller.updateSeller);

/**
 * @swagger
 * /api/v1/sellers/{id}/approve:
 *   post:
 *     summary: Approve seller (admin)
 *     description: Approve a pending seller account (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.post('/:id/approve', controller.approveSeller);

/**
 * @swagger
 * /api/v1/sellers/{id}/reject:
 *   post:
 *     summary: Reject seller (admin)
 *     description: Reject a pending seller account (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller rejected successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.post('/:id/reject', controller.rejectSeller);

/**
 * @swagger
 * /api/v1/sellers/{id}/suspend:
 *   post:
 *     summary: Suspend seller (admin)
 *     description: Suspend an active seller account (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller suspended successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.post('/:id/suspend', controller.suspendSeller);

/**
 * @swagger
 * /api/v1/sellers/{id}:
 *   delete:
 *     summary: Delete seller (admin)
 *     description: Permanently delete a seller account (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.delete('/:id', controller.deleteSeller);

/**
 * @swagger
 * /api/v1/sellers/{id}/stats:
 *   get:
 *     summary: Get seller statistics (admin)
 *     description: Retrieve statistics for a specific seller (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller unique identifier
 *     responses:
 *       200:
 *         description: Seller statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Seller not found
 */
router.get('/:id/stats', controller.getSellerStats);

/**
 * @swagger
 * /api/v1/sellers/sync-product-counts:
 *   post:
 *     summary: Sync product counts (admin)
 *     description: Synchronize product counts for all sellers (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product counts synchronized successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/sync-product-counts', controller.syncAllSellerProductCounts);

export default router; 