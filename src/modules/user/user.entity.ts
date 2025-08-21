import {
  Entity,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { BaseEntity } from "../../common/entities/base.entity";
import { USER_TYPE } from "../../constants/user";
import { Role } from "../role/entities/role.entity";
import { Address } from "../address/address.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         type:
 *           type: string
 *           enum: [admin, seller, buyer]
 *           description: User type/role
 *           example: "seller"
 *         firstName:
 *           type: string
 *           description: User's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User's last name
 *           example: "Doe"
 *         userName:
 *           type: string
 *           nullable: true
 *           description: User's username
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: User's phone number
 *           example: "+1234567890"
 *         emailVerified:
 *           type: boolean
 *           description: Whether email is verified
 *           example: false
 *         isActive:
 *           type: boolean
 *           description: Whether user account is active
 *           example: true
 *         documentId:
 *           type: string
 *           nullable: true
 *           description: Firebase document ID for migration purposes
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User account last update timestamp
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Role'
 *           description: User's assigned roles
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 *           description: User's addresses
 */

@Entity("users")
export class User extends BaseEntity {
  @Column({
    comment: "admin, seller, buyer. Roles outside of the scope has no effect",
    enum: USER_TYPE,
  })
  type: `${USER_TYPE}`;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  userName?: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    nullable: true,
    comment: "Phone number",
  })
  phone?: string;

  @Column({ default: false, nullable: true })
  emailVerified?: boolean;

  @Column({ default: false, nullable: true })
  isActive?: boolean;

  @Column({ nullable: true, comment: "Firebase document ID for migration purposes" })
  documentId?: string;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: "user_roles",
    joinColumn: { name: "userId" },
    inverseJoinColumn: { name: "roleId" },
  })
  roles?: Role[];

  @OneToMany(() => Address, address => address.user)
  addresses?: Address[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
