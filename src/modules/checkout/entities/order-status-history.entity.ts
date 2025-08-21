import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";
import { ORDER_STATUS } from "./order.enums";
import { User } from "../../user/user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderStatusHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the status history entry
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: ID of the order this status change belongs to
 *         status:
 *           $ref: '#/components/schemas/ORDER_STATUS'
 *           description: New status after the change
 *         changedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the user who made the status change
 *         notes:
 *           type: string
 *           nullable: true
 *           description: Additional notes about the status change
 *           example: "Order shipped via express delivery"
 *         notificationSent:
 *           type: boolean
 *           description: Whether notification was sent for this status change
 *           example: true
 *         previousStatus:
 *           $ref: '#/components/schemas/ORDER_STATUS'
 *           description: Previous status before the change
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Status change timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         order:
 *           $ref: '#/components/schemas/Order'
 *           description: Order this status change belongs to
 *         changedByUser:
 *           $ref: '#/components/schemas/User'
 *           description: User who made the status change
 */

@Entity("order_status_history")
export class OrderStatusHistory extends BaseEntity {
  @Column()
  orderId: string;

  @Column({
    type: "enum",
    enum: ORDER_STATUS,
    enumName: "order_status_enum",
    default: ORDER_STATUS.PENDING,
  })
  status: ORDER_STATUS;

  @Column({ nullable: true })
  changedBy: string;

  @Column("text", { nullable: true })
  notes: string;

  @Column({ default: false })
  notificationSent: boolean;

  @Column({
    type: "enum",
    enum: ORDER_STATUS,
    enumName: "order_status_enum",
    nullable: true,
    default: ORDER_STATUS.PENDING,
  })
  previousStatus: ORDER_STATUS;

  // Relationships
  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "changedBy" })
  changedByUser?: User;
}
