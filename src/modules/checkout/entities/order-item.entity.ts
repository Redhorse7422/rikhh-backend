import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

export interface SelectedVariant {
  attributeId: string;
  attributeName: string;
  variantValue: string;
  attributePrice: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the order item
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: ID of the order this item belongs to
 *         productId:
 *           type: string
 *           format: uuid
 *           description: ID of the product
 *         productName:
 *           type: string
 *           description: Name of the product at time of order
 *           example: "Premium Wireless Headphones"
 *         productSlug:
 *           type: string
 *           nullable: true
 *           description: Product slug for URL generation
 *           example: "premium-wireless-headphones"
 *         quantity:
 *           type: integer
 *           description: Quantity of the product ordered
 *           example: 2
 *         unitPrice:
 *           type: number
 *           format: decimal
 *           description: Unit price of the product at time of order
 *           example: 49.99
 *         totalPrice:
 *           type: number
 *           format: decimal
 *           description: Total price for this item (unitPrice * quantity)
 *           example: 99.98
 *         productSnapshot:
 *           type: object
 *           additionalProperties: true
 *           description: Snapshot of product data at time of order
 *         selectedVariants:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               attributeId:
 *                 type: string
 *                 format: uuid
 *               attributeName:
 *                 type: string
 *               variantValue:
 *                 type: string
 *               attributePrice:
 *                 type: number
 *           description: Selected product variants and their prices
 *         sku:
 *           type: string
 *           nullable: true
 *           description: Product SKU
 *           example: "HW-001-BLK"
 *         taxAmount:
 *           type: number
 *           format: decimal
 *           description: Tax amount for this item
 *           example: 8.99
 *         discountAmount:
 *           type: number
 *           format: decimal
 *           description: Discount amount applied to this item
 *           example: 5.00
 *         thumbnailImage:
 *           type: string
 *           nullable: true
 *           description: Product thumbnail image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Order item creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Order item last update timestamp
 *         order:
 *           $ref: '#/components/schemas/Order'
 *           description: Order this item belongs to
 *         product:
 *           $ref: '#/components/schemas/Product'
 *           description: Product information
 */

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSlug: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('simple-json', { nullable: true })
  productSnapshot: any;

  @Column('simple-json', { nullable: true })
  selectedVariants: SelectedVariant[];

  @Column({ nullable: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  thumbnailImage: string;

  // Relationships
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;
} 