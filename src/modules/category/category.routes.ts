import { Router } from "express";
import { Category } from "./category.entity";
import { categoryController } from "./category.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../permissions/entities/permission.entity";
import { AppDataSource } from "../../config/database";
import { globalFormDataBoolean } from "../../common/middlewares/global-formdata-boolean";

const router = Router();
const categoryRepository = AppDataSource.getRepository(Category);

const {
  createCategory,
  getCategories,
  getCategory,
  getCategoriesUnrestricted,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getParentCategories,
  getSubCategories,
} = categoryController(categoryRepository);

/**
 * @swagger
 * /api/v1/categories/store:
 *   post:
 *     summary: Create a new category
 *     description: Create a new product category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post(
  "/store",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.CREATE_CATEGORY),
  // globalFormDataBoolean,
  validateDto(CreateCategoryDto),
  createCategory
);

/**
 * @swagger
 * /api/v1/categories/all:
 *   get:
 *     summary: Get all categories (restricted)
 *     description: Retrieve all categories with authentication and permissions
 *     tags: [Categories]
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
 *         description: Search term for filtering categories
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/all",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getCategories
);

/**
 * @swagger
 * /api/v1/categories/all/unrestricted:
 *   get:
 *     summary: Get all categories (unrestricted)
 *     description: Retrieve all categories without authentication
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get("/all/unrestricted", getCategoriesUnrestricted);

/**
 * @swagger
 * /api/v1/categories/parents:
 *   get:
 *     summary: Get parent categories
 *     description: Retrieve only parent categories (top-level categories)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parent categories retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/parents",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getParentCategories
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Retrieve a specific category by its ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category unique identifier
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.get(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}/subcategories:
 *   get:
 *     summary: Get subcategories
 *     description: Retrieve subcategories of a specific parent category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent category ID
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Parent category not found
 */
router.get(
  "/:id/subcategories",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_CATEGORY),
  getSubCategories
);

/**
 * @swagger
 * /api/v1/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     description: Retrieve a category using its URL slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category URL slug (e.g., "electronics")
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/slug/:slug", getCategoryBySlug);

/**
 * @swagger
 * /api/v1/categories/update/{id}:
 *   put:
 *     summary: Update a category
 *     description: Update an existing category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryDto'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.put(
  "/update/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.UPDATE_CATEGORY),
  globalFormDataBoolean,
  validateDto(UpdateCategoryDto),
  updateCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     description: Permanently delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category unique identifier
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.delete(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.DELETE_CATEGORY),
  deleteCategory
);

export default router;
