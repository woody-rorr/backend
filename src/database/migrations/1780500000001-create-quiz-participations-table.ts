import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizParticipationsTable1780500000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz_participations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "quiz_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "prediction" varchar(10) NOT NULL,
        "is_correct" boolean NULL,
        "participated_at" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "fk_quiz_participations_quizzes" FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") ON DELETE CASCADE,
        CONSTRAINT "chk_quiz_participations_prediction" CHECK ("prediction" IN ('WIN','LOSE','DRAW')),
        CONSTRAINT "uq_quiz_participations_quiz_id_user_id" UNIQUE ("quiz_id", "user_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_quiz_participations_user_id" ON "quiz_participations" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quiz_participations_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quiz_participations"`);
  }
}
