import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1780358400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "calendar_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "description" text,
        "start_time" timestamptz NOT NULL,
        "end_time" timestamptz NOT NULL,
        "location" varchar(255),
        "is_all_day" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_events" PRIMARY KEY ("id"),
        CONSTRAINT "fk_events_calendars" FOREIGN KEY ("calendar_id")
          REFERENCES "calendars"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_events_calendar_id" ON "events" ("calendar_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_events_start_time" ON "events" ("start_time")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_events_start_time"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_events_calendar_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
  }
}
