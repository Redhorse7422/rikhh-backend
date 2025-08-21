import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../user/user.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatusHistory } from "./order-status-history.entity";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "./order.enums";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the order
 *         orderNumber:
 *           type: string
 *           description: Human-readable order number
 *           example: "ORD-2024-001"
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the user who placed the order (null for guest orders)
 *         guestId:
 *           type: string
 *           nullable: true
 *           description: ID for guest orders
 *         status:
 *           $ref: '#/components/schemas/ORDER_STATUS'
 *           description: Current status of the order
 *         subtotal:
 *           type: number
 *           format: decimal
 *           description: Subtotal amount before tax and shipping
 *           example: 99.99
 *         taxAmount:
 *           type: number
 *           format: decimal
 *           description: Tax amount
 *           example: 8.99
 *         shippingAmount:
 *           type: number
 *           format: decimal
 *           description: Shipping cost
 *           example: 5.99
 *         discountAmount:
 *           type: number
 *           format: decimal
 *           description: Discount amount from coupons
 *           example: 10.00
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: Total order amount
 *           example: 104.97
 *         paymentStatus:
 *           $ref: '#/components/schemas/PAYMENT_STATUS'
 *           description: Current payment status
 *         paymentMethod:
 *           $ref: '#/components/schemas/PAYMENT_METHOD'
 *           description: Payment method used
 *         paymentTransactionId:
 *           type: string
 *           nullable: true
 *           description: Payment gateway transaction ID
 *         shippingAddress:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             company:
 *               type: string
 *             addressLine1:
 *               type: string
 *             addressLine2:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *             phone:
 *               type: string
 *         trackingNumber:
 *           type: string
 *           nullable: true
 *           description: Shipping tracking number
 *         estimatedDeliveryDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Estimated delivery date
 *         notes:
 *           type: string
 *           nullable: true
 *           description: Order notes
 *         customerEmail:
 *           type: string
 *           nullable: true
 *           description: Customer email (for guest orders)
 *         customerFirstName:
 *           type: string
 *           nullable: true
 *           description: Customer first name (for guest orders)
 *         customerLastName:
 *           type: string
 *           nullable: true
 *           description: Customer last name (for guest orders)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Order creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Order last update timestamp
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *           description: Order items/products
 *         statusHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderStatusHistory'
 *           description: Order status change history
 */

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  guestId: string;

  @Column({
    type: "enum",
    enum: ORDER_STATUS,
    enumName: "order_status_enum",
    default: ORDER_STATUS.PENDING,
  })
  status: ORDER_STATUS;

  // Financial Information
  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number;

  // Payment Information
  @Column({
    type: "enum",
    enum: PAYMENT_STATUS,
    enumName: "payment_status_enum",
    default: PAYMENT_STATUS.PENDING,
  })
  paymentStatus: PAYMENT_STATUS;

  @Column({
    type: "enum",
    enum: PAYMENT_METHOD,
    enumName: "payment_method_enum",
    default: PAYMENT_METHOD.CASH_ON_DELIVERY,
  })
  paymentMethod: PAYMENT_METHOD;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column("text", { nullable: true })
  paymentGatewayResponse: string;

  // Shipping Information
  @Column("simple-json")
  shippingAddress: ShippingAddress;

  @Column("simple-json", { nullable: true })
  billingAddress: BillingAddress;

  @Column({ nullable: true })
  shippingMethod: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ nullable: true })
  actualDeliveryDate: Date;

  // Additional Information
  @Column("text", { nullable: true })
  notes: string;

  @Column("text", { nullable: true })
  adminNotes: string;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  // Customer Information (for guest orders)
  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerFirstName: string;

  @Column({ nullable: true })
  customerLastName: string;

  @Column({ nullable: true })
  customerPhone: string;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, {
    cascade: true,
  })
  statusHistory: OrderStatusHistory[];
}
