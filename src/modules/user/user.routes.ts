import { Router } from "express";
import { register, getProfile, getUsers } from "./user.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CreateUserDto } from "./dto/create-user.dto";
import { GetUsersQueryDto } from "./dto/get-users-query.dto";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../permissions/entities/permission.entity";

const router = Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post("/register", validateDto(CreateUserDto), register);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/profile",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_USER),
  getProfile
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with pagination and filtering
 *     tags: [Users]
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
 *         description: Search term for filtering users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_USER),
  validateDto(GetUsersQueryDto),
  getUsers
);

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users (alternative endpoint)
 *     description: Alternative endpoint to retrieve all users with pagination and filtering
 *     tags: [Users]
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
 *         description: Search term for filtering users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/all",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.READ_USER),
  validateDto(GetUsersQueryDto),
  getUsers
);

export default router;
