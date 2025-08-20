import { Router } from 'express';
import { Coupon } from './coupon.entity';
import { couponController } from './coupon.controller';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { RequirePermissions } from '../permissions/decorators/require-permissions.decorator';
import { PERMISSION_TYPE } from '../permissions/entities/permission.entity';
import { AppDataSource } from '../../config/database';

const router = Router();
const couponRepository = AppDataSource.getRepository(Coupon);

const {
  createCoupon,
  getCoupons,
  getCoupon,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  deactivateCoupon,
  activateCoupon,
  getCouponStats,
  bulkCreateCoupons,
  exportCoupons,
  checkCodeAvailability
} = couponController(couponRepository);

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Create a new coupon
 *     description: Create a new discount coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCouponDto'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(CreateCouponDto),
  createCoupon
);

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Get all coupons
 *     description: Retrieve a list of all coupons with pagination and filtering
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
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
 *         description: Search term for filtering coupons
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCoupons
);

/**
 * @swagger
 * /api/v1/coupons/stats:
 *   get:
 *     summary: Get coupon statistics
 *     description: Retrieve statistics about coupon usage and performance
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/stats',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCouponStats
);

/**
 * @swagger
 * /api/v1/coupons/export:
 *   get:
 *     summary: Export coupons
 *     description: Export coupons data to CSV or Excel format
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons exported successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/export',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  exportCoupons
);

/**
 * @swagger
 * /api/v1/coupons/bulk:
 *   post:
 *     summary: Bulk create coupons
 *     description: Create multiple coupons at once
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Coupons created successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post(
  '/bulk',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  bulkCreateCoupons
);

/**
 * @swagger
 * /api/v1/coupons/check-code/{code}:
 *   get:
 *     summary: Check coupon code availability
 *     description: Check if a coupon code is available for use
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon code to check
 *     responses:
 *       200:
 *         description: Code availability checked successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/check-code/:code',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  checkCodeAvailability
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID
 *     description: Retrieve a specific coupon by its ID
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon unique identifier
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Coupon not found
 */
router.get(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  getCoupon
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   put:
 *     summary: Update a coupon
 *     description: Update an existing coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCouponDto'
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Coupon not found
 */
router.put(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  validateDto(UpdateCouponDto),
  updateCoupon
);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   delete:
 *     summary: Delete a coupon
 *     description: Permanently delete a coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon unique identifier
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Coupon not found
 */
router.delete(
  '/:id',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  deleteCoupon
);

/**
 * @swagger
 * /api/v1/coupons/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a coupon
 *     description: Deactivate an active coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon unique identifier
 *     responses:
 *       200:
 *         description: Coupon deactivated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Coupon not found
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  deactivateCoupon
);

/**
 * @swagger
 * /api/v1/coupons/{id}/activate:
 *   patch:
 *     summary: Activate a coupon
 *     description: Activate a deactivated coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon unique identifier
 *     responses:
 *       200:
 *         description: Coupon activated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Coupon not found
 */
router.patch(
  '/:id/activate',
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_STORE),
  activateCoupon
);

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   post:
 *     summary: Validate a coupon
 *     description: Validate a coupon code during checkout
 *     tags: [Coupons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateCouponDto'
 *     responses:
 *       200:
 *         description: Coupon validated successfully
 *       400:
 *         description: Invalid coupon code or validation error
 *       404:
 *         description: Coupon not found
 */
router.post(
  '/validate',
  validateDto(ValidateCouponDto),
  validateCoupon
);

/**
 * @swagger
 * /api/v1/coupons/code/{code}:
 *   get:
 *     summary: Get coupon by code
 *     description: Retrieve a coupon using its code
 *     tags: [Coupons]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Coupon code
 *     responses:
 *       200:
 *         description: Coupon retrieved successfully
 *       404:
 *         description: Coupon not found
 */
router.get(
  '/code/:code',
  getCouponByCode
);

export default router; 