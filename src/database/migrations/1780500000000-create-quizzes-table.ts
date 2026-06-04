import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzesTable1780500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "match_id" varchar(100) NOT NULL,
        "closed_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_quizzes_closed_at" ON "quizzes" ("closed_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_quizzes_closed_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "quizzes"`);
  }
}
