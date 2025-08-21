// src/modules/checkout/entities/order.enums.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     ORDER_STATUS:
 *       type: string
 *       enum: [pending, seller_notified, seller_accepted, confirmed, processing, shipped, delivered, cancelled, refunded, returned]
 *       description: Available order statuses for the order lifecycle
 *       example: "processing"
 *     PAYMENT_STATUS:
 *       type: string
 *       enum: [pending, authorized, captured, failed, cancelled, refunded, partially_refunded]
 *       description: Available payment statuses
 *       example: "captured"
 *     PAYMENT_METHOD:
 *       type: string
 *       enum: [cash_on_delivery]
 *       description: Available payment methods
 *       example: "cash_on_delivery"
 *     COMMISSION_STATUS:
 *       type: string
 *       enum: [pending, calculated, paid, cancelled]
 *       description: Available commission statuses
 *       example: "calculated"
 */

export enum ORDER_STATUS {
  PENDING = "pending",
  SELLER_NOTIFIED = "seller_notified", // New: Seller has been notified
  SELLER_ACCEPTED = "seller_accepted", // New: Seller accepted the order
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  RETURNED = "returned",
}

export enum PAYMENT_STATUS {
  PENDING = "pending",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PAYMENT_METHOD {
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export enum COMMISSION_STATUS { // New Enum
  PENDING = "pending",
  CALCULATED = "calculated",
  PAID = "paid",
  CANCELLED = "cancelled",
}
