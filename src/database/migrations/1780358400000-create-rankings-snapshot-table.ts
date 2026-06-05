import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRankingsSnapshotTable1780358400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rankings_snapshot',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'period', type: 'varchar', length: '16', isNullable: false },
          { name: 'metric', type: 'varchar', length: '32', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'rankings_snapshot',
      new TableIndex({
        name: 'idx_rankings_snapshot_period_metric',
        columnNames: ['period', 'metric'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('rankings_snapshot', 'idx_rankings_snapshot_period_metric');
    await queryRunner.dropTable('rankings_snapshot');
  }
}
