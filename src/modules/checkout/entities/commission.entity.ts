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
import { COMMISSION_STATUS } from "./order.enums";

@Entity("commissions")
@Index(["orderId"])
@Index(["sellerId"])
@Index(["status"])
export class Commission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  orderId: string;

  @Column({ type: "uuid" })
  sellerId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  orderAmount: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({
    type: "enum",
    enum: COMMISSION_STATUS,
    default: COMMISSION_STATUS.PENDING
  })
  status: COMMISSION_STATUS;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "timestamp", nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sellerId" })
  seller: User;
}
