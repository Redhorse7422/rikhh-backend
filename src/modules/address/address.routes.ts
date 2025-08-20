import { Router } from 'express';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesQueryDto } from './dto/get-addresses-query.dto';
import * as addressController from './address.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address
 *     description: Create a new address for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddressDto'
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post(
  '/',
  authenticate,
  validateDto(CreateAddressDto),
  addressController.createAddress
);

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get all addresses
 *     description: Retrieve all addresses for the authenticated user with pagination
 *     tags: [Addresses]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [shipping, billing, both]
 *         description: Filter by address type
 *       - in: query
 *         name: isDefault
 *         schema:
 *           type: boolean
 *         description: Filter by default status
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  '/',
  authenticate,
  validateDto(GetAddressesQueryDto, 'query'),
  addressController.getAddresses
);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   get:
 *     summary: Get address by ID
 *     description: Retrieve a specific address by its ID
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address unique identifier
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found
 */
router.get(
  '/:addressId',
  authenticate,
  addressController.getAddressById
);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     description: Update an existing address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAddressDto'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found
 */
router.put(
  '/:addressId',
  authenticate,
  validateDto(UpdateAddressDto),
  addressController.updateAddress
);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     description: Permanently delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address unique identifier
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found
 */
router.delete(
  '/:addressId',
  authenticate,
  addressController.deleteAddress
);

/**
 * @swagger
 * /api/v1/addresses/{addressId}/default:
 *   patch:
 *     summary: Set address as default
 *     description: Set an address as the default for its type
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: Address unique identifier
 *     responses:
 *       200:
 *         description: Address set as default successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found
 */
router.patch(
  '/:addressId/default',
  authenticate,
  addressController.setDefaultAddress
);

/**
 * @swagger
 * /api/v1/addresses/default/{type}:
 *   get:
 *     summary: Get default address by type
 *     description: Retrieve the default address for a specific type
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [shipping, billing, both]
 *         description: Type of address to retrieve
 *     responses:
 *       200:
 *         description: Default address retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Default address not found
 */
router.get(
  '/default/:type',
  authenticate,
  addressController.getDefaultAddress
);

/**
 * @swagger
 * /api/v1/addresses/type/{type}:
 *   get:
 *     summary: Get addresses by type
 *     description: Retrieve all addresses of a specific type for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [shipping, billing, both]
 *         description: Type of addresses to retrieve
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
 *         description: Addresses retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  '/type/:type',
  authenticate,
  addressController.getAddressesByType
);

export default router; 