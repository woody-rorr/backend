import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSparksTable1780704000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE sparks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, amount integer NOT NULL, reason varchar(20) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT chk_sparks_reason CHECK (reason IN ('LOGIN','BOOST_PRE','BOOST_LIVE','QUIZ','RANKING_REWARD')), CONSTRAINT fk_sparks_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE INDEX idx_sparks_user_id_created_at ON sparks (user_id, created_at)`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sparks_user_id_created_at`);
    await queryRunner.query(`DROP TABLE sparks`);
  }
}
