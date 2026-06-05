import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRankingsSummaryMetaTable1780358400004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rankings_summary_meta',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'snapshot_id', type: 'uuid', isNullable: false },
          { name: 'top_n', type: 'int', isNullable: false },
          { name: 'max_value', type: 'int', isNullable: false },
          { name: 'graph_width', type: 'int', isNullable: false },
          { name: 'is_no_data', type: 'boolean', default: false, isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'rankings_summary_meta',
      new TableIndex({
        name: 'uq_rankings_summary_meta_snapshot_id',
        columnNames: ['snapshot_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createForeignKey(
      'rankings_summary_meta',
      new TableForeignKey({
        name: 'fk_rankings_summary_meta_rankings_snapshot',
        columnNames: ['snapshot_id'],
        referencedTableName: 'rankings_snapshot',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'rankings_summary_meta',
      'fk_rankings_summary_meta_rankings_snapshot',
    );
    await queryRunner.dropIndex('rankings_summary_meta', 'uq_rankings_summary_meta_snapshot_id');
    await queryRunner.dropTable('rankings_summary_meta');
  }
}
