import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../modules/user/user.entity';

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the address
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who owns this address
 *         type:
 *           type: string
 *           description: Address type
 *           example: "shipping"
 *         firstName:
 *           type: string
 *           description: First name for the address
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: Last name for the address
 *           example: "Doe"
 *         company:
 *           type: string
 *           nullable: true
 *           description: Company name
 *           example: "Acme Corp"
 *         addressLine1:
 *           type: string
 *           description: Primary address line
 *           example: "123 Main Street"
 *         addressLine2:
 *           type: string
 *           nullable: true
 *           description: Secondary address line
 *           example: "Apt 4B"
 *         city:
 *           type: string
 *           description: City name
 *           example: "New York"
 *         state:
 *           type: string
 *           description: State or province
 *           example: "NY"
 *         postalCode:
 *           type: string
 *           description: Postal or ZIP code
 *           example: "10001"
 *         country:
 *           type: string
 *           description: Country name
 *           example: "United States"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Phone number
 *           example: "+1234567890"
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default address
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Address creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Address last update timestamp
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: User who owns this address
 */

export enum ADDRESS_TYPE {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both'
}

export enum ADDRESS_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEFAULT = 'default'
}

@Entity('addresses')
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.addresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ADDRESS_TYPE,
    default: ADDRESS_TYPE.SHIPPING
  })
  type: ADDRESS_TYPE;

  @Column({
    type: 'enum',
    enum: ADDRESS_STATUS,
    default: ADDRESS_STATUS.ACTIVE
  })
  status: ADDRESS_STATUS;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  postalCode: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 