import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSellerOrderManagement1755000000000 implements MigrationInterface {
  name = "AddSellerOrderManagement1755000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create commission_status_enum
    await queryRunner.query(`
      CREATE TYPE "public"."commission_status_enum" AS ENUM(
        'pending',
        'calculated',
        'paid',
        'cancelled'
      )
    `);

    // Create notification_type_enum
    await queryRunner.query(`
      CREATE TYPE "public"."notification_type_enum" AS ENUM(
        'new_order',
        'order_accepted',
        'order_status_update',
        'commission_earned'
      )
    `);

    // Create notification_status_enum
    await queryRunner.query(`
      CREATE TYPE "public"."notification_status_enum" AS ENUM(
        'unread',
        'read',
        'archived'
      )
    `);

    // Update order_status_enum to include new statuses
    await queryRunner.query(`
      ALTER TYPE "public"."order_status_enum" ADD VALUE 'seller_notified'
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."order_status_enum" ADD VALUE 'seller_accepted'
    `);

    // Create commissions table
    await queryRunner.query(`
      CREATE TABLE "public"."commissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "sellerId" uuid NOT NULL,
        "orderAmount" decimal(10,2) NOT NULL,
        "commissionRate" decimal(5,2) NOT NULL,
        "commissionAmount" decimal(10,2) NOT NULL,
        "status" "public"."commission_status_enum" NOT NULL DEFAULT 'pending',
        "notes" text,
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_commissions" PRIMARY KEY ("id")
      )
    `);

    // Create seller_notifications table
    await queryRunner.query(`
      CREATE TABLE "public"."seller_notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sellerId" uuid NOT NULL,
        "orderId" uuid NOT NULL,
        "type" "public"."notification_type_enum" NOT NULL,
        "status" "public"."notification_status_enum" NOT NULL DEFAULT 'unread',
        "title" character varying(255) NOT NULL,
        "message" text NOT NULL,
        "metadata" jsonb,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_seller_notifications" PRIMARY KEY ("id")
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_orderId" ON "public"."commissions" ("orderId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_sellerId" ON "public"."commissions" ("sellerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_commissions_status" ON "public"."commissions" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_seller_notifications_sellerId" ON "public"."seller_notifications" ("sellerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_seller_notifications_orderId" ON "public"."seller_notifications" ("orderId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_seller_notifications_type" ON "public"."seller_notifications" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_seller_notifications_status" ON "public"."seller_notifications" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_seller_notifications_createdAt" ON "public"."seller_notifications" ("createdAt")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "public"."commissions" 
      ADD CONSTRAINT "FK_commissions_order" 
      FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."commissions" 
      ADD CONSTRAINT "FK_commissions_seller" 
      FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."seller_notifications" 
      ADD CONSTRAINT "FK_seller_notifications_seller" 
      FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."seller_notifications" 
      ADD CONSTRAINT "FK_seller_notifications_order" 
      FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "public"."seller_notifications" DROP CONSTRAINT "FK_seller_notifications_order"
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."seller_notifications" DROP CONSTRAINT "FK_seller_notifications_seller"
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."commissions" DROP CONSTRAINT "FK_commissions_seller"
    `);
    await queryRunner.query(`
      ALTER TABLE "public"."commissions" DROP CONSTRAINT "FK_commissions_order"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "public"."IDX_seller_notifications_createdAt"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_seller_notifications_status"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_seller_notifications_type"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_seller_notifications_orderId"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_seller_notifications_sellerId"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_commissions_status"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_commissions_sellerId"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_commissions_orderId"
    `);

    // Drop tables
    await queryRunner.query(`
      DROP TABLE "public"."seller_notifications"
    `);
    await queryRunner.query(`
      DROP TABLE "public"."commissions"
    `);

    // Note: We cannot easily remove enum values in PostgreSQL, so we'll leave the order_status_enum as is
    // The new statuses will remain but won't cause issues

    // Drop enums
    await queryRunner.query(`
      DROP TYPE "public"."notification_status_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."notification_type_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."commission_status_enum"
    `);
  }
}
