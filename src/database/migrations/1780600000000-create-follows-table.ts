import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowsTable1780600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "follows" (
        "follower_id" uuid NOT NULL,
        "following_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_follows" PRIMARY KEY ("follower_id", "following_id"),
        CONSTRAINT "ck_follows_no_self_follow" CHECK ("follower_id" <> "following_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_follows_follower_id" ON "follows" ("follower_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_follows_following_id" ON "follows" ("following_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_follows_following_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_follows_follower_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "follows"`);
  }
}
