import { Entity, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../user/user.entity";
import { Product } from "../../products/entities/product.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the seller
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user associated with this seller account
 *         businessName:
 *           type: string
 *           description: Business name
 *           example: "Tech Gadgets Store"
 *         businessDescription:
 *           type: string
 *           nullable: true
 *           description: Business description
 *           example: "Premium tech gadgets and accessories"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Business phone number
 *           example: "+1234567890"
 *         address:
 *           type: string
 *           nullable: true
 *           description: Business address
 *           example: "123 Business St, City, State 12345"
 *         website:
 *           type: string
 *           nullable: true
 *           description: Business website
 *           example: "https://techgadgets.com"
 *         verificationStatus:
 *           type: string
 *           description: Seller verification status
 *           example: "verified"
 *         rating:
 *           type: number
 *           format: decimal
 *           description: Average seller rating
 *           example: 4.8
 *         reviewCount:
 *           type: integer
 *           description: Number of reviews received
 *           example: 150
 *         isActive:
 *           type: boolean
 *           description: Whether seller account is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Seller account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Seller account last update timestamp
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: User account associated with this seller
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *           description: Products sold by this seller
 */

export enum SELLER_STATUS {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
}

export enum SELLER_VERIFICATION_STATUS {
  UNVERIFIED = "unverified",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

@Entity("sellers")
export class Seller extends BaseEntity {
  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column({ nullable: true })
  businessPhone: string;

  @Column({ nullable: true })
  businessEmail: string;

  @Column({ nullable: true })
  businessWebsite: string;

  @Column({ nullable: true })
  businessAddress: string;

  @Column({ nullable: true })
  businessCity: string;

  @Column({ nullable: true })
  businessState: string;

  @Column({ nullable: true })
  businessPostalCode: string;

  @Column({ nullable: true })
  businessCountry: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  licenseExpiryDate: Date;

  @Column({
    type: "enum",
    enum: SELLER_STATUS,
    default: SELLER_STATUS.PENDING,
  })
  status: SELLER_STATUS;

  @Column({
    type: "enum",
    enum: SELLER_VERIFICATION_STATUS,
    default: SELLER_VERIFICATION_STATUS.UNVERIFIED,
  })
  verificationStatus: SELLER_VERIFICATION_STATUS;

  @Column({ nullable: true })
  verificationDocuments: string; // JSON string of document URLs

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ default: 0 })
  totalProducts: number;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ default: 0 })
  totalRevenue: number;

  @Column({ type: "decimal", precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ nullable: true })
  commissionRate: number; // Percentage commission for platform

  @Column({ nullable: true })
  payoutMethod: string; // bank_transfer, paypal, stripe

  @Column({ nullable: true })
  payoutDetails: string; // JSON string of payout details

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ nullable: true })
  documentId: string;
}
