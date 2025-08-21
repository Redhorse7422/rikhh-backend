import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Category } from "../../category/category.entity";
import { MediaFile } from "../../media/media-file.entity";
import { Attribute } from "../../attributes/entities/attribute.entity";
import { Seller } from "../../seller/entities/seller.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the product
 *         addedBy:
 *           type: string
 *           nullable: true
 *           description: ID of the user who added the product
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who owns the product
 *         sellerId:
 *           type: string
 *           nullable: true
 *           description: ID of the seller who owns the product
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Premium Wireless Headphones"
 *         slug:
 *           type: string
 *           description: Product slug for URL generation
 *           example: "premium-wireless-headphones"
 *         thumbnailImgId:
 *           type: string
 *           nullable: true
 *           description: ID of the thumbnail image
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Product tags
 *           example: ["wireless", "bluetooth", "audio"]
 *         shortDescription:
 *           type: string
 *           nullable: true
 *           description: Short product description
 *         longDescription:
 *           type: string
 *           nullable: true
 *           description: Detailed product description
 *         regularPrice:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           description: Regular product price
 *           example: 99.99
 *         salePrice:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           description: Sale price of the product
 *           example: 79.99
 *         isVariant:
 *           type: boolean
 *           description: Whether product has variants
 *           example: false
 *         published:
 *           type: boolean
 *           description: Whether product is published
 *           example: true
 *         approved:
 *           type: boolean
 *           description: Whether product is approved
 *           example: true
 *         stock:
 *           type: integer
 *           nullable: true
 *           description: Available stock quantity
 *           example: 50
 *         cashOnDelivery:
 *           type: boolean
 *           description: Whether cash on delivery is accepted
 *           example: true
 *         featured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: false
 *         discount:
 *           type: number
 *           format: decimal
 *           nullable: true
 *           description: Discount amount
 *           example: 20.00
 *         discountType:
 *           type: string
 *           nullable: true
 *           description: Type of discount
 *           example: "percentage"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Product last update timestamp
 *         seller:
 *           $ref: '#/components/schemas/Seller'
 *           description: Seller information
 *         photos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MediaFile'
 *           description: Product photos
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *           description: Product categories
 */

@Entity("products")
export class Product extends BaseEntity {
  @Column({ nullable: true })
  addedBy: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sellerId: string;

  @ManyToOne(() => Seller, { nullable: true })
  @JoinColumn({ name: "sellerId" })
  seller: Seller;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => MediaFile)
  @JoinTable()
  photos: MediaFile[];

  @Column({ nullable: true })
  thumbnailImgId: string;

  @ManyToOne(() => MediaFile, { nullable: true })
  @JoinColumn({ name: "thumbnailImgId" })
  thumbnailImg?: MediaFile;

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  categories: Category[];

  @Column("simple-array", { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  shortDescription: string;

  @Column({ nullable: true })
  longDescription: string;

  @Column("decimal", { nullable: true })
  regularPrice: number;

  @Column("decimal", { nullable: true })
  salePrice: number;

  @Column({ default: false })
  isVariant: boolean;

  @Column({ default: false })
  published: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column("int", { nullable: true })
  stock: number;

  @Column({ default: false })
  cashOnDelivery: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column("decimal", { nullable: true })
  discount: number;

  @Column({ nullable: true })
  discountType: string;

  @Column({ nullable: true })
  discountStartDate: Date;

  @Column({ nullable: true })
  discountEndDate: Date;

  @Column("decimal", { nullable: true })
  tax: number;

  @Column({ nullable: true })
  taxType: string;

  @Column({ nullable: true })
  shippingType: string;

  @Column("decimal", { nullable: true })
  shippingCost: number;

  @Column("int", { nullable: true })
  estShippingDays: number;

  @Column("int", { nullable: true })
  numOfSales: number;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @Column("decimal", { nullable: true })
  rating: number;

  @Column({ nullable: true })
  externalLink: string;

  @Column({ nullable: true })
  externalLinkBtn: string;

  @OneToMany(() => Attribute, (attribute) => attribute.product)
  attributes?: Attribute[];

  @Column({ nullable: true })
  lat: string;

  @Column({ nullable: true })
  lng: string;
}
