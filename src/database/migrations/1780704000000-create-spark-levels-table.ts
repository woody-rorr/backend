import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSparkLevelsTable1780704000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE spark_levels (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, total_spark integer NOT NULL DEFAULT 0, level integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT uq_spark_levels_user_id UNIQUE (user_id), CONSTRAINT fk_spark_levels_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE spark_levels`);
  }
}
