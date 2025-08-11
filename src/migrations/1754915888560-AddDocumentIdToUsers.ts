import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentIdToUsers1754915888560 implements MigrationInterface {
    name = 'AddDocumentIdToUsers1754915888560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "documentId" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "users"."documentId" IS 'Firebase document ID for migration purposes'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "users"."documentId" IS 'Firebase document ID for migration purposes'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "documentId"`);
    }

}
