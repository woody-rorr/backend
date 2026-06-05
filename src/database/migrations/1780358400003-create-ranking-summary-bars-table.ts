import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRankingSummaryBarsTable1780358400003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ranking_summary_bars',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'snapshot_id', type: 'uuid', isNullable: false },
          { name: 'rank', type: 'int', isNullable: false },
          { name: 'value', type: 'int', isNullable: false },
          { name: 'label', type: 'varchar', length: '128', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'ranking_summary_bars',
      new TableIndex({
        name: 'idx_ranking_summary_bars_snapshot_id_rank',
        columnNames: ['snapshot_id', 'rank'],
      }),
    );
    await queryRunner.createForeignKey(
      'ranking_summary_bars',
      new TableForeignKey({
        name: 'fk_ranking_summary_bars_rankings_snapshot',
        columnNames: ['snapshot_id'],
        referencedTableName: 'rankings_snapshot',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'ranking_summary_bars',
      'fk_ranking_summary_bars_rankings_snapshot',
    );
    await queryRunner.dropIndex(
      'ranking_summary_bars',
      'idx_ranking_summary_bars_snapshot_id_rank',
    );
    await queryRunner.dropTable('ranking_summary_bars');
  }
}
