import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSparksTable1780617600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sparks',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'total_spark', type: 'bigint', isNullable: false, default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE INDEX "idx_sparks_user_id" ON "sparks" ("user_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_sparks_user_id"');
    await queryRunner.dropTable('sparks', true);
  }
}
