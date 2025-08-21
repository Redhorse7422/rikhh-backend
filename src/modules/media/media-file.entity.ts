import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { User } from "../user/user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     MediaFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the media file
 *         scope:
 *           type: string
 *           description: Resource scope (admin, seller, buyer)
 *           example: "seller"
 *         uri:
 *           type: string
 *           nullable: true
 *           description: File path in S3 bucket for internal files
 *           example: "uploads/products/headphones.jpg"
 *         url:
 *           type: string
 *           nullable: true
 *           description: File URL for public media files
 *           example: "https://example.com/images/headphones.jpg"
 *         fileName:
 *           type: string
 *           description: Original file name
 *           example: "headphones.jpg"
 *         mimetype:
 *           type: string
 *           description: File MIME type
 *           example: "image/jpeg"
 *         size:
 *           type: integer
 *           description: File size in bytes
 *           example: 1024000
 *         userId:
 *           type: string
 *           nullable: true
 *           description: ID of the user who uploaded the file
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: File upload timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: File last update timestamp
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: User who uploaded the file
 */

export enum USER_SCOPE {
  ADMIN = 'admin',
  SELLER = 'seller',
  BUYER = 'buyer'
}

@Entity({ name: 'media_files' })
export class MediaFile extends BaseEntity {
  @Column({ 
    comment: 'Resource scope e.g. admin, seller, buyer', 
    default: USER_SCOPE.ADMIN 
  })
  scope: USER_SCOPE;

  @Column({
    unique: true,
    nullable: true,
    comment: 'File path in S3 bucket for internal files. The URL should be composed on retrieval using a pre-signed URL.',
  })
  uri?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'File URL for public media files (products, blog posts)',
  })
  url?: string;

  @Column()
  fileName: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  userId?: string;
} 