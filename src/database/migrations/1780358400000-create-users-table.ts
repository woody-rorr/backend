import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1780358400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "google_id" varchar(255) NOT NULL,
        "email" varchar(320) NOT NULL,
        "display_name" varchar(255) NOT NULL,
        "profile_image_url" varchar(1024),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_google_id" ON "users" ("google_id")`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uq_users_email"`);
    await queryRunner.query(`DROP INDEX "uq_users_google_id"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
