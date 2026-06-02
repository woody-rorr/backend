import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSparkTransactionsTable1780358500001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "spark_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "amount" integer NOT NULL,
        "reason" varchar(32) NOT NULL,
        "description" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_spark_transactions_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_spark_transactions_reason" CHECK ("reason" IN ('LOGIN_DAILY','BOOST_PRE','BOOST_LIVE','QUIZ_PARTICIPATE','QUIZ_RANKING','RANKING_REWARD','ACHIEVEMENT'))
      );
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_spark_transactions_user_id_created_at"
      ON "spark_transactions" ("user_id", "created_at");
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_spark_transactions_login_daily"
      ON "spark_transactions" ("user_id", (("created_at" AT TIME ZONE 'UTC')::date))
      WHERE "reason" = 'LOGIN_DAILY';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uq_spark_transactions_login_daily";`);
    await queryRunner.query(`DROP INDEX "idx_spark_transactions_user_id_created_at";`);
    await queryRunner.query(`DROP TABLE "spark_transactions";`);
  }
}
