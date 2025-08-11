import { MigrationInterface, QueryRunner } from "typeorm";

export class UpadtedProduct1754910705552 implements MigrationInterface {
    name = 'UpadtedProduct1754910705552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "lat" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "lng" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "lat"`);
    }

}
