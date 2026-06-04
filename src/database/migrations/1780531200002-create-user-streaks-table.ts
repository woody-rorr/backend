import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserStreaksTable1780531200002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_streaks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "current_streak" integer NOT NULL DEFAULT 0,
        "longest_streak" integer NOT NULL DEFAULT 0,
        "last_answered_at" timestamptz NULL,
        "last_quiz_id" uuid NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_streaks" PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_streaks_user_id" UNIQUE ("user_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_user_streaks_longest_streak" ON "user_streaks" ("longest_streak")`);
    await queryRunner.query(`
      ALTER TABLE "user_streaks"
      ADD CONSTRAINT "fk_user_streaks_quizzes"
      FOREIGN KEY ("last_quiz_id") REFERENCES "quizzes" ("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          ALTER TABLE "user_streaks"
          ADD CONSTRAINT "fk_user_streaks_users"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_streaks" DROP CONSTRAINT IF EXISTS "fk_user_streaks_users"`);
    await queryRunner.query(`ALTER TABLE "user_streaks" DROP CONSTRAINT "fk_user_streaks_quizzes"`);
    await queryRunner.query(`DROP INDEX "idx_user_streaks_longest_streak"`);
    await queryRunner.query(`DROP TABLE "user_streaks"`);
  }
}
