import { Router } from 'express';
import { attributeController } from './attribute.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { GetAttributesQueryDto } from './dto/get-attributes-query.dto';
import { AppDataSource } from '../../config/database';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

// Helper to wrap async route handlers
function catchAsync(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const router = Router();
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const ctrl = attributeController(attributeRepository, attributeValueRepository);

/**
 * @swagger
 * /api/v1/attributes:
 *   get:
 *     summary: Get all attributes
 *     description: Retrieve a list of all product attributes with pagination and filtering
 *     tags: [Attributes]
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
 *         description: Search term for filtering attributes
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by attribute type
 *     responses:
 *       200:
 *         description: Attributes retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get('/', validateDto(GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAllAttributes));

/**
 * @swagger
 * /api/v1/attributes/{id}:
 *   get:
 *     summary: Get attribute by ID
 *     description: Retrieve a specific attribute by its ID
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *     responses:
 *       200:
 *         description: Attribute retrieved successfully
 *       404:
 *         description: Attribute not found
 */
router.get('/:id', catchAsync(ctrl.getAttributeById));

/**
 * @swagger
 * /api/v1/attributes:
 *   post:
 *     summary: Create a new attribute
 *     description: Create a new product attribute
 *     tags: [Attributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeDto'
 *     responses:
 *       201:
 *         description: Attribute created successfully
 *       400:
 *         description: Validation error or invalid data
 *       409:
 *         description: Attribute already exists
 */
router.post('/', validateDto(CreateAttributeDto), catchAsync(ctrl.createAttribute));

/**
 * @swagger
 * /api/v1/attributes/{id}:
 *   put:
 *     summary: Update an attribute
 *     description: Update an existing product attribute
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeDto'
 *     responses:
 *       200:
 *         description: Attribute updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Attribute not found
 */
router.put('/:id', validateDto(UpdateAttributeDto), catchAsync(ctrl.updateAttribute));

/**
 * @swagger
 * /api/v1/attributes/{id}:
 *   delete:
 *     summary: Delete an attribute
 *     description: Permanently delete a product attribute
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *     responses:
 *       200:
 *         description: Attribute deleted successfully
 *       404:
 *         description: Attribute not found
 */
router.delete('/:id', catchAsync(ctrl.deleteAttribute));

/**
 * @swagger
 * /api/v1/attributes/{id}/values:
 *   get:
 *     summary: Get attribute values
 *     description: Retrieve all values for a specific attribute
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
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
 *         description: Attribute values retrieved successfully
 *       404:
 *         description: Attribute not found
 */
router.get('/:id/values', validateDto(GetAttributesQueryDto, 'query'), catchAsync(ctrl.getAttributeValues));

/**
 * @swagger
 * /api/v1/attributes/{id}/values/{valueId}:
 *   get:
 *     summary: Get attribute value by ID
 *     description: Retrieve a specific attribute value by its ID
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute value unique identifier
 *     responses:
 *       200:
 *         description: Attribute value retrieved successfully
 *       404:
 *         description: Attribute or attribute value not found
 */
router.get('/:id/values/:valueId', catchAsync(ctrl.getAttributeValueById));

/**
 * @swagger
 * /api/v1/attributes/{id}/values:
 *   post:
 *     summary: Create an attribute value
 *     description: Create a new value for a specific attribute
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttributeValueDto'
 *     responses:
 *       201:
 *         description: Attribute value created successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Attribute not found
 *       409:
 *         description: Attribute value already exists
 */
router.post('/:id/values', validateDto(CreateAttributeValueDto), catchAsync(ctrl.createAttributeValue));

/**
 * @swagger
 * /api/v1/attributes/{id}/values/{valueId}:
 *   put:
 *     summary: Update an attribute value
 *     description: Update an existing attribute value
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute value unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttributeValueDto'
 *     responses:
 *       200:
 *         description: Attribute value updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Attribute or attribute value not found
 */
router.put('/:id/values/:valueId', validateDto(UpdateAttributeValueDto), catchAsync(ctrl.updateAttributeValue));

/**
 * @swagger
 * /api/v1/attributes/{id}/values/{valueId}:
 *   delete:
 *     summary: Delete an attribute value
 *     description: Permanently delete an attribute value
 *     tags: [Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute unique identifier
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attribute value unique identifier
 *     responses:
 *       200:
 *         description: Attribute value deleted successfully
 *       404:
 *         description: Attribute or attribute value not found
 */
router.delete('/:id/values/:valueId', catchAsync(ctrl.deleteAttributeValue));

export default router;