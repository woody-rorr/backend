import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRankingSnapshotTables1716810000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rankings_snapshot" (
        "id" BIGSERIAL PRIMARY KEY,
        "period" varchar(16) NOT NULL,
        "metric" varchar(32) NOT NULL,
        "top_limit" int NOT NULL,
        "cursor" varchar(128),
        "next_cursor" varchar(128),
        "updated_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_rankings_snapshot_period_metric_updated"
        ON "rankings_snapshot" ("period", "metric", "updated_at" DESC)
    `);
    await queryRunner.query(`
      CREATE TABLE "ranking_items" (
        "snapshot_id" bigint NOT NULL,
        "rank" int NOT NULL,
        "user_id" varchar(64) NOT NULL,
        "nickname" varchar(64) NOT NULL,
        "avatar_url" text,
        "value" numeric NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_ranking_items" PRIMARY KEY ("snapshot_id", "rank"),
        CONSTRAINT "fk_ranking_items_snapshot" FOREIGN KEY ("snapshot_id")
          REFERENCES "rankings_snapshot"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "ranking_me" (
        "snapshot_id" bigint NOT NULL,
        "rank" int,
        "user_id" varchar(64) NOT NULL,
        "nickname" varchar(64) NOT NULL,
        "avatar_url" text,
        "value" numeric,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_ranking_me" PRIMARY KEY ("snapshot_id"),
        CONSTRAINT "fk_ranking_me_snapshot" FOREIGN KEY ("snapshot_id")
          REFERENCES "rankings_snapshot"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "ranking_summary_bars" (
        "snapshot_id" bigint NOT NULL,
        "bar_index" int NOT NULL,
        "user_id" varchar(64),
        "user_name" varchar(64),
        "current_streak" varchar(32),
        "streak_long" int,
        "streak_rate" numeric,
        "avatar_url" text,
        "rank" int,
        "value" numeric,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_ranking_summary_bars" PRIMARY KEY ("snapshot_id", "bar_index"),
        CONSTRAINT "fk_ranking_summary_bars_snapshot" FOREIGN KEY ("snapshot_id")
          REFERENCES "rankings_snapshot"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "rankings_summary_meta" (
        "snapshot_id" bigint NOT NULL,
        "top_n" int NOT NULL,
        "max_value" numeric,
        "graph_width" int,
        "is_no_data" boolean NOT NULL DEFAULT false,
        "updated_at" timestamptz NOT NULL,
        CONSTRAINT "pk_rankings_summary_meta" PRIMARY KEY ("snapshot_id"),
        CONSTRAINT "fk_rankings_summary_meta_snapshot" FOREIGN KEY ("snapshot_id")
          REFERENCES "rankings_snapshot"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "rankings_summary_meta"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ranking_summary_bars"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ranking_me"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ranking_items"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rankings_snapshot_period_metric_updated"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rankings_snapshot"`);
  }
}
