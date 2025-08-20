import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateReferralTables1700000000000 implements MigrationInterface {
    name = 'CreateReferralTables1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create referral_codes table
        await queryRunner.createTable(
            new Table({
                name: "referral_codes",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "20",
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["seller_account", "product"],
                        isNullable: false,
                    },
                    {
                        name: "productId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "sellerId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "commissionRate",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: "expiresAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "usageCount",
                        type: "int",
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "maxUsage",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create referrals table
        await queryRunner.createTable(
            new Table({
                name: "referrals",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "referrerId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "referredId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["seller_account", "product"],
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "active", "completed", "expired", "cancelled"],
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: "referralCode",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "productId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "sellerId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "commissionRate",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "totalCommission",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: "expiresAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "activatedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "completedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create referral_commissions table
        await queryRunner.createTable(
            new Table({
                name: "referral_commissions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "referralId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "orderId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "orderAmount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "commissionRate",
                        type: "decimal",
                        precision: 5,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "commissionAmount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "earned", "paid", "cancelled"],
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: "paidAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "payoutTransactionId",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create foreign key constraints
        await queryRunner.createForeignKey(
            "referral_codes",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "referral_codes",
            new TableForeignKey({
                columnNames: ["productId"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "referral_codes",
            new TableForeignKey({
                columnNames: ["sellerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "sellers",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "referrals",
            new TableForeignKey({
                columnNames: ["referrerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "referrals",
            new TableForeignKey({
                columnNames: ["referredId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "referrals",
            new TableForeignKey({
                columnNames: ["productId"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "referrals",
            new TableForeignKey({
                columnNames: ["sellerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "sellers",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "referral_commissions",
            new TableForeignKey({
                columnNames: ["referralId"],
                referencedColumnNames: ["id"],
                referencedTableName: "referrals",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "referral_commissions",
            new TableForeignKey({
                columnNames: ["orderId"],
                referencedColumnNames: ["id"],
                referencedTableName: "orders",
                onDelete: "CASCADE",
            })
        );

        // Create indexes for better performance
        await queryRunner.createIndex(
            "referral_codes",
            new TableIndex({
                name: "IDX_REFERRAL_CODES_CODE",
                columnNames: ["code"],
            })
        );

        await queryRunner.createIndex(
            "referral_codes",
            new TableIndex({
                name: "IDX_REFERRAL_CODES_USER_TYPE",
                columnNames: ["userId", "type"],
            })
        );

        await queryRunner.createIndex(
            "referrals",
            new TableIndex({
                name: "IDX_REFERRALS_REFERRER",
                columnNames: ["referrerId"],
            })
        );

        await queryRunner.createIndex(
            "referrals",
            new TableIndex({
                name: "IDX_REFERRALS_REFERRED",
                columnNames: ["referredId"],
            })
        );

        await queryRunner.createIndex(
            "referrals",
            new TableIndex({
                name: "IDX_REFERRALS_STATUS_TYPE",
                columnNames: ["status", "type"],
            })
        );

        await queryRunner.createIndex(
            "referral_commissions",
            new TableIndex({
                name: "IDX_REFERRAL_COMMISSIONS_REFERRAL",
                columnNames: ["referralId"],
            })
        );

        await queryRunner.createIndex(
            "referral_commissions",
            new TableIndex({
                name: "IDX_REFERRAL_COMMISSIONS_STATUS",
                columnNames: ["status"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order
        await queryRunner.dropTable("referral_commissions");
        await queryRunner.dropTable("referrals");
        await queryRunner.dropTable("referral_codes");
    }
}
