import { Column, Entity, JoinTable, ManyToMany, Unique } from "typeorm";

import { BaseEntity } from "../../../common/entities/base.entity";
import { Permission } from "../../permissions/entities/permission.entity";
import { User } from "../../user/user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the role
 *         name:
 *           type: string
 *           description: Role name
 *           example: "admin"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Role description
 *           example: "Administrator role with full access"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Role creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Role last update timestamp
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           description: Users assigned to this role
 */

export const ADMIN_ROLE = 'ADMIN';

@Entity({ name: "roles" })
@Unique(["name"])
export class Role extends BaseEntity {
  static readonly ADMIN = ADMIN_ROLE;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: "role_permissions",
    joinColumn: { name: "roleId" },
    inverseJoinColumn: { name: "permissionName", referencedColumnName: "name" },
  })
  permissions: Permission[];

  @ManyToMany(() => User, user => user.roles)
  users: User[];
}
