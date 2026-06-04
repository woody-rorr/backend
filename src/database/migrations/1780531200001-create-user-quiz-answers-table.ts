import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserQuizAnswersTable1780531200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_quiz_answers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "quiz_id" uuid NOT NULL,
        "answer" varchar(255) NOT NULL,
        "is_correct" boolean NOT NULL,
        "submitted_at" timestamptz NOT NULL DEFAULT now(),
        "spark_awarded" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user_quiz_answers" PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_quiz_answers_user_id_quiz_id" UNIQUE ("user_id", "quiz_id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_user_quiz_answers_user_id" ON "user_quiz_answers" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_user_quiz_answers_quiz_id" ON "user_quiz_answers" ("quiz_id")`);
    await queryRunner.query(`
      ALTER TABLE "user_quiz_answers"
      ADD CONSTRAINT "fk_user_quiz_answers_quizzes"
      FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
          ALTER TABLE "user_quiz_answers"
          ADD CONSTRAINT "fk_user_quiz_answers_users"
          FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_quiz_answers" DROP CONSTRAINT IF EXISTS "fk_user_quiz_answers_users"`);
    await queryRunner.query(`ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "fk_user_quiz_answers_quizzes"`);
    await queryRunner.query(`DROP INDEX "idx_user_quiz_answers_quiz_id"`);
    await queryRunner.query(`DROP INDEX "idx_user_quiz_answers_user_id"`);
    await queryRunner.query(`DROP TABLE "user_quiz_answers"`);
  }
}
