import { Router } from "express";
import { AppDataSource } from "../../config/database";
import { Order } from "../checkout/entities/order.entity";
import { orderController } from "./order.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../permissions/entities/permission.entity";
import { OrderService } from "./order.service";

const router = Router();
const orderRepository = AppDataSource.getRepository(Order);
const ctrl = orderController(new OrderService(orderRepository));

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     description: Retrieve a list of all orders with pagination and filtering (admin only)
 *     tags: [Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders until this date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getAllOrders
);

/**
 * @swagger
 * /api/v1/orders/stats:
 *   get:
 *     summary: Get order statistics (admin)
 *     description: Retrieve comprehensive order statistics and analytics (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year, custom]
 *           default: month
 *         description: Time period for statistics
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/stats",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getStats
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID (admin)
 *     description: Retrieve detailed information about a specific order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order unique identifier
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.get(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getOrderById
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status (admin)
 *     description: Update the status of a specific order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned]
 *                 description: New order status
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *               trackingNumber:
 *                 type: string
 *                 description: Tracking number for shipping status
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status or validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Order not found
 */
router.put(
  "/:id/status",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.updateOrderStatus
);

export default router;
