import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSparkBalancesTable1780358500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "spark_balances" (
        "user_id" uuid PRIMARY KEY,
        "total_spark" integer NOT NULL DEFAULT 0,
        "level" integer NOT NULL DEFAULT 1,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_spark_balances_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "spark_balances";`);
  }
}
