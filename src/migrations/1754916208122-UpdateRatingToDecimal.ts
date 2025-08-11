import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRatingToDecimal1754916208122 implements MigrationInterface {
    name = 'UpdateRatingToDecimal1754916208122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rating" numeric(3,1) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rating" integer NOT NULL DEFAULT '0'`);
    }

}
