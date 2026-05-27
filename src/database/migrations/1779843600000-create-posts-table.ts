import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostsTable1779843600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "author_id" uuid NOT NULL,
        "title" varchar(200) NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "pk_posts" PRIMARY KEY ("id"),
        CONSTRAINT "fk_posts_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_posts_author_id" ON "posts" ("author_id");`);
    await queryRunner.query(`CREATE INDEX "idx_posts_created_at" ON "posts" ("created_at" DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_posts_created_at";`);
    await queryRunner.query(`DROP INDEX "idx_posts_author_id";`);
    await queryRunner.query(`DROP TABLE "posts";`);
  }
}
