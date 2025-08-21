import { Router } from "express";
import { DataSource } from "typeorm";
import { SellerOrderController } from "../controllers/seller-order.controller";
import { authenticate } from "../../auth/middlewares/auth.middleware";
import { requireSeller } from "../../auth/middlewares/user-type.middleware";

export function createSellerOrderRoutes(dataSource: DataSource): Router {
  const router = Router();
  const sellerOrderController = new SellerOrderController(dataSource);

  // Apply authentication and authorization to all routes
  router.use(authenticate);
  router.use(requireSeller);

  /**
   * @swagger
   * /api/v1/seller/orders:
   *   get:
   *     summary: Get seller's orders
   *     description: Retrieve a list of all orders containing products from the authenticated seller with pagination and filtering
   *     tags: [Seller Orders]
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
   *           enum: [pending, seller_notified, seller_accepted, confirmed, processing, shipped, delivered, cancelled, refunded, returned]
   *         description: Filter orders by status
   *     responses:
   *       200:
   *         description: Orders retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     orders:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Order'
   *                     total:
   *                       type: integer
   *                       description: Total number of orders
   *                     page:
   *                       type: integer
   *                       description: Current page number
   *                     limit:
   *                       type: integer
   *                       description: Number of items per page
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller
   *       500:
   *         description: Internal server error
   */
  router.get("/orders", sellerOrderController.getSellerOrders.bind(sellerOrderController));

  /**
   * @swagger
   * /api/v1/seller/orders/accept:
   *   post:
   *     summary: Accept an order
   *     description: Accept an order that has been notified to the seller. This changes the order status from 'seller_notified' to 'seller_accepted'
   *     tags: [Seller Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SellerOrderAcceptDto'
   *     responses:
   *       200:
   *         description: Order accepted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     order:
   *                       $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - Order cannot be accepted in current status
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller or access denied to this order
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  router.post("/orders/accept", sellerOrderController.acceptOrder.bind(sellerOrderController));

  /**
   * @swagger
   * /api/v1/seller/orders/status:
   *   put:
   *     summary: Update order status
   *     description: Update the status of an order. This allows sellers to progress orders through the fulfillment process
   *     tags: [Seller Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SellerOrderUpdateDto'
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     order:
   *                       $ref: '#/components/schemas/Order'
   *       400:
   *         description: Bad request - Invalid status transition
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller or access denied to this order
   *       404:
   *         description: Order not found
   *       500:
   *         description: Internal server error
   */
  router.put("/orders/status", sellerOrderController.updateOrderStatus.bind(sellerOrderController));

  /**
   * @swagger
   * /api/v1/seller/notifications:
   *   get:
   *     summary: Get seller notifications
   *     description: Retrieve notifications for the authenticated seller with pagination
   *     tags: [Seller Orders]
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
   *           default: 20
   *         description: Number of notifications per page
   *     responses:
   *       200:
   *         description: Notifications retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     notifications:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/SellerNotification'
   *                     total:
   *                       type: integer
   *                       description: Total number of notifications
   *                     page:
   *                       type: integer
   *                       description: Current page number
   *                     limit:
   *                       type: integer
   *                       description: Number of items per page
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller
   *       500:
   *         description: Internal server error
   */
  router.get("/notifications", sellerOrderController.getNotifications.bind(sellerOrderController));

  /**
   * @swagger
   * /api/v1/seller/notifications/{notificationId}/read:
   *   put:
   *     summary: Mark notification as read
   *     description: Mark a specific notification as read for the authenticated seller
   *     tags: [Seller Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Notification unique identifier
   *     responses:
   *       200:
   *         description: Notification marked as read successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     notification:
   *                       $ref: '#/components/schemas/SellerNotification'
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller
   *       404:
   *         description: Notification not found
   *       500:
   *         description: Internal server error
   */
  router.put("/notifications/:notificationId/read", sellerOrderController.markNotificationAsRead.bind(sellerOrderController));

  /**
   * @swagger
   * /api/v1/seller/commissions/summary:
   *   get:
   *     summary: Get commission summary
   *     description: Retrieve commission summary for the authenticated seller including pending, calculated, and paid commissions
   *     tags: [Seller Orders]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Commission summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "200"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalEarnings:
   *                       type: number
   *                       description: Total earnings from all orders
   *                     totalCommission:
   *                       type: number
   *                       description: Total commission amount
   *                     pendingCommission:
   *                       type: number
   *                       description: Commission pending calculation
   *                     calculatedCommission:
   *                       type: number
   *                       description: Commission calculated but not paid
   *                     paidCommission:
   *                       type: number
   *                       description: Commission already paid
   *                     commissionRate:
   *                       type: number
   *                       description: Commission rate percentage
   *       401:
   *         description: Unauthorized - Invalid or missing token
   *       403:
   *         description: Forbidden - User is not a seller
   *       500:
   *         description: Internal server error
   */
  router.get("/commissions/summary", sellerOrderController.getCommissionSummary.bind(sellerOrderController));

  return router;
}
