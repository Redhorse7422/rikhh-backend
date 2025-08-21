import { Entity, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { MediaFile } from "../media/media-file.entity";
import { Product } from "../products/entities/product.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the category
 *         isParent:
 *           type: boolean
 *           description: Whether this is a parent category
 *           example: true
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the parent category (null for top-level categories)
 *         name:
 *           type: string
 *           description: Category name
 *           example: "Electronics"
 *         slug:
 *           type: string
 *           description: Category slug for URL generation
 *           example: "electronics"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Category description
 *           example: "Electronic devices and gadgets"
 *         isActive:
 *           type: boolean
 *           description: Whether category is active
 *           example: true
 *         thumbnailImageId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the thumbnail image
 *         coverImageId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of the cover image
 *         isFeatured:
 *           type: boolean
 *           description: Whether category is featured
 *           example: false
 *         isPopular:
 *           type: boolean
 *           description: Whether category is popular
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Category last update timestamp
 *         parent:
 *           $ref: '#/components/schemas/Category'
 *           description: Parent category (if this is a subcategory)
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *           description: Subcategories (if this is a parent category)
 *         thumbnailImage:
 *           $ref: '#/components/schemas/MediaFile'
 *           description: Category thumbnail image
 *         coverImage:
 *           $ref: '#/components/schemas/MediaFile'
 *           description: Category cover image
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 *           description: Products in this category
 */

@Entity("categories")
export class Category extends BaseEntity {
  @Column({ default: false, nullable: true })
  isParent: boolean;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parentId" })
  parent?: Category;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false, nullable: true })
  isActive?: boolean;

  @Column({ nullable: true })
  thumbnailImageId?: string;

  @ManyToOne(() => MediaFile, { nullable: true, cascade: true })
  @JoinColumn({ name: "thumbnailImageId" })
  thumbnailImage?: MediaFile;

  @Column({ nullable: true })
  coverImageId?: string;

  @ManyToOne(() => MediaFile, { nullable: true, cascade: true })
  @JoinColumn({ name: "coverImageId" })
  coverImage?: MediaFile;

  @Column({ default: false, nullable: true })
  isFeatured?: boolean;

  @Column({ default: false, nullable: true })
  isPopular?: boolean;


}
