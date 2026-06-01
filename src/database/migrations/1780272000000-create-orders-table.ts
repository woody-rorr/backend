import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1780272000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_number" varchar(32) NOT NULL,
        "user_id" uuid NOT NULL,
        "status" varchar(20) NOT NULL,
        "items" jsonb NOT NULL DEFAULT '[]',
        "total_amount" numeric(12,2) NOT NULL,
        "currency" varchar(3) NOT NULL,
        "shipping_address" varchar(500) NOT NULL,
        "notes" varchar(1000),
        "paid_at" timestamptz,
        "cancelled_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "pk_orders" PRIMARY KEY ("id"),
        CONSTRAINT "uq_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "chk_orders_status" CHECK ("status" IN ('pending','paid','shipped','delivered','cancelled'))
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_orders_user_id" ON "orders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_user_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
  }
}
