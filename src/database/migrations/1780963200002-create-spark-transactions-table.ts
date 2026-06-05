import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSparkTransactionsTable1780963200002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "spark_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "amount" integer NOT NULL,
        "type" varchar NOT NULL,
        "reference_id" varchar,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_spark_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "chk_spark_transactions_type" CHECK (
          "type" IN ('quiz_reward', 'ranking_reward', 'purchase', 'admin_adjust')
        ),
        CONSTRAINT "fk_spark_transactions_users" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_spark_transactions_user_id"
        ON "spark_transactions" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_spark_transactions_user_id"`);
    await queryRunner.query(`DROP TABLE "spark_transactions"`);
  }
}
