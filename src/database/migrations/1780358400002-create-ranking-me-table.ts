import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRankingMeTable1780358400002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ranking_me',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'snapshot_id', type: 'uuid', isNullable: false },
          { name: 'user_id', type: 'varchar', length: '64', isNullable: false },
          { name: 'rank', type: 'int', isNullable: false },
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
      'ranking_me',
      new TableIndex({
        name: 'idx_ranking_me_snapshot_id_user_id',
        columnNames: ['snapshot_id', 'user_id'],
      }),
    );
    await queryRunner.createForeignKey(
      'ranking_me',
      new TableForeignKey({
        name: 'fk_ranking_me_rankings_snapshot',
        columnNames: ['snapshot_id'],
        referencedTableName: 'rankings_snapshot',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ranking_me', 'fk_ranking_me_rankings_snapshot');
    await queryRunner.dropIndex('ranking_me', 'idx_ranking_me_snapshot_id_user_id');
    await queryRunner.dropTable('ranking_me');
  }
}
