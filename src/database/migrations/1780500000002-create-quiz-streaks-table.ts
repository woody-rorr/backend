import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizStreaksTable1780500000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz_streaks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "period" varchar(7) NOT NULL,
        "current_streak" int NOT NULL DEFAULT 0,
        "max_streak_monthly" int NOT NULL DEFAULT 0,
        "last_updated" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_quiz_streaks_user_id_period" UNIQUE ("user_id", "period")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_quiz_streaks_period_max_streak_monthly" ON "quiz_streaks" ("period", "max_streak_monthly")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quiz_streaks_period_max_streak_monthly"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quiz_streaks"`);
  }
}
