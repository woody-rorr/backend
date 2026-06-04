import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzesTable1780531200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "match_id" varchar(100) NOT NULL,
        "question" text NOT NULL,
        "options" jsonb NOT NULL,
        "correct_answer" varchar(255) NOT NULL,
        "deadline" timestamptz NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'ACTIVE',
        "spark_reward" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_quizzes" PRIMARY KEY ("id"),
        CONSTRAINT "chk_quizzes_status" CHECK ("status" IN ('ACTIVE', 'CLOSED', 'SETTLED'))
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_quizzes_match_id" ON "quizzes" ("match_id")`);
    await queryRunner.query(`CREATE INDEX "idx_quizzes_status" ON "quizzes" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_quizzes_status"`);
    await queryRunner.query(`DROP INDEX "idx_quizzes_match_id"`);
    await queryRunner.query(`DROP TABLE "quizzes"`);
  }
}
