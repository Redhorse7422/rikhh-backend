import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from "typeorm";
import { Order } from "./order.entity";
import { User } from "../../user/user.entity";

export enum NOTIFICATION_TYPE {
  NEW_ORDER = "new_order",
  ORDER_ACCEPTED = "order_accepted",
  ORDER_STATUS_UPDATE = "order_status_update",
  COMMISSION_EARNED = "commission_earned"
}

export enum NOTIFICATION_STATUS {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived"
}

/**
 * @swagger
 * components:
 *   schemas:
 *     SellerNotification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the notification
 *         sellerId:
 *           type: string
 *           format: uuid
 *           description: ID of the seller receiving the notification
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: ID of the order related to this notification
 *         type:
 *           type: string
 *           enum: [new_order, order_accepted, order_status_update, commission_earned]
 *           description: Type of notification
 *           example: "new_order"
 *         status:
 *           type: string
 *           enum: [unread, read, archived]
 *           description: Current status of the notification
 *           example: "unread"
 *         title:
 *           type: string
 *           description: Notification title
 *           example: "New Order Received"
 *         message:
 *           type: string
 *           description: Detailed notification message
 *           example: "You have received a new order #ORD-2024-001. Please review and accept the order."
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional data related to the notification
 *           example:
 *             orderNumber: "ORD-2024-001"
 *             orderTotal: 99.99
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when notification was marked as read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Notification creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Notification last update timestamp
 *         seller:
 *           $ref: '#/components/schemas/User'
 *           description: Seller user information
 *         order:
 *           $ref: '#/components/schemas/Order'
 *           description: Order information
 */

@Entity("seller_notifications")
@Index(["sellerId"])
@Index(["orderId"])
@Index(["type"])
@Index(["status"])
@Index(["createdAt"])
export class SellerNotification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  sellerId: string;

  @Column({ type: "uuid" })
  orderId: string;

  @Column({
    type: "enum",
    enum: NOTIFICATION_TYPE
  })
  type: NOTIFICATION_TYPE;

  @Column({
    type: "enum",
    enum: NOTIFICATION_STATUS,
    default: NOTIFICATION_STATUS.UNREAD
  })
  status: NOTIFICATION_STATUS;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sellerId" })
  seller: User;

  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;
}
