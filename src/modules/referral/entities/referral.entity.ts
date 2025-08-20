import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../user/user.entity";
import { Seller } from "../../seller/entities/seller.entity";
import { Product } from "../../products/entities/product.entity";
import { Order } from "../../checkout/entities/order.entity";

export enum REFERRAL_TYPE {
  SELLER_ACCOUNT = "seller_account",
  PRODUCT = "product",
}

export enum REFERRAL_STATUS {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum COMMISSION_STATUS {
  PENDING = "pending",
  EARNED = "earned",
  PAID = "paid",
  CANCELLED = "cancelled",
}

@Entity("referrals")
export class Referral extends BaseEntity {
  @Column()
  referrerId: string; // User who made the referral

  @Column()
  referredId: string; // User who was referred

  @Column({
    type: "enum",
    enum: REFERRAL_TYPE,
  })
  type: REFERRAL_TYPE;

  @Column({
    type: "enum",
    enum: REFERRAL_STATUS,
    default: REFERRAL_STATUS.PENDING,
  })
  status: REFERRAL_STATUS;

  @Column({ nullable: true })
  referralCode: string; // The referral code used

  @Column({ nullable: true })
  productId: string; // For product referrals

  @Column({ nullable: true })
  sellerId: string; // For seller account referrals

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  commissionRate: number; // Commission percentage

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalCommission: number; // Total commission earned

  @Column({ nullable: true })
  expiresAt: Date; // When the referral expires

  @Column({ nullable: true })
  activatedAt: Date; // When the referral was activated

  @Column({ nullable: true })
  completedAt: Date; // When the referral was completed

  @Column({ nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "referrerId" })
  referrer: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "referredId" })
  referred: User;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: Product;

  @ManyToOne(() => Seller, { nullable: true })
  @JoinColumn({ name: "sellerId" })
  seller?: Seller;

  @OneToMany(() => ReferralCommission, (commission) => commission.referral)
  commissions: ReferralCommission[];
}

@Entity("referral_commissions")
export class ReferralCommission extends BaseEntity {
  @Column()
  referralId: string;

  @Column()
  orderId: string;

  @Column("decimal", { precision: 10, scale: 2 })
  orderAmount: number;

  @Column("decimal", { precision: 5, scale: 2 })
  commissionRate: number;

  @Column("decimal", { precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({
    type: "enum",
    enum: COMMISSION_STATUS,
    default: COMMISSION_STATUS.PENDING,
  })
  status: COMMISSION_STATUS;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  payoutTransactionId: string;

  @Column({ nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => Referral, { nullable: false })
  @JoinColumn({ name: "referralId" })
  referral: Referral;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: "orderId" })
  order: Order;
}

@Entity("referral_codes")
export class ReferralCode extends BaseEntity {
  @Column()
  userId: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: REFERRAL_TYPE,
  })
  type: REFERRAL_TYPE;

  @Column({ nullable: true })
  productId: string; // For product-specific referral codes

  @Column({ nullable: true })
  sellerId: string; // For seller account referral codes

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  commissionRate: number; // Override default commission rate

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  maxUsage: number; // null means unlimited

  @Column({ nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: "productId" })
  product?: Product;

  @ManyToOne(() => Seller, { nullable: true })
  @JoinColumn({ name: "sellerId" })
  seller?: Seller;
}
