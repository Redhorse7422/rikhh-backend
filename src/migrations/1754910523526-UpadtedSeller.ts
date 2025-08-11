import { MigrationInterface, QueryRunner } from "typeorm";

export class UpadtedSeller1754910523526 implements MigrationInterface {
    name = 'UpadtedSeller1754910523526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" ADD "fcmToken" character varying`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "referralCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "referralCode"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "fcmToken"`);
    }

}
