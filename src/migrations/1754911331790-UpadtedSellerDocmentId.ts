import { MigrationInterface, QueryRunner } from "typeorm";

export class UpadtedSellerDocmentId1754911331790 implements MigrationInterface {
    name = 'UpadtedSellerDocmentId1754911331790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" ADD "documentId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "documentId"`);
    }

}
