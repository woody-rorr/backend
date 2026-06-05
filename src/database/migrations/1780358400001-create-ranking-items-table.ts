import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRankingItemsTable1780358400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ranking_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'snapshot_id', type: 'uuid', isNullable: false },
          { name: 'rank', type: 'int', isNullable: false },
          { name: 'user_id', type: 'varchar', length: '64', isNullable: false },
          { name: 'score', type: 'int', isNullable: false },
          { name: 'avatar_url', type: 'varchar', length: '512', isNullable: true },
          { name: 'username', type: 'varchar', length: '128', isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'ranking_items',
      new TableIndex({
        name: 'idx_ranking_items_snapshot_id_rank',
        columnNames: ['snapshot_id', 'rank'],
      }),
    );
    await queryRunner.createForeignKey(
      'ranking_items',
      new TableForeignKey({
        name: 'fk_ranking_items_rankings_snapshot',
        columnNames: ['snapshot_id'],
        referencedTableName: 'rankings_snapshot',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ranking_items', 'fk_ranking_items_rankings_snapshot');
    await queryRunner.dropIndex('ranking_items', 'idx_ranking_items_snapshot_id_rank');
    await queryRunner.dropTable('ranking_items');
  }
}
