import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzesTable1780185600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id" SERIAL PRIMARY KEY,
        "title" varchar(200) NOT NULL,
        "description" varchar(1000),
        "difficulty" varchar(16) NOT NULL DEFAULT 'MEDIUM',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "chk_quizzes_difficulty" CHECK ("difficulty" IN ('EASY', 'MEDIUM', 'HARD'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "quizzes"`);
  }
}
