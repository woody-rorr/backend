import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRankingsTable1780358400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rankings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'longest_streak', type: 'int', isNullable: false, default: 0 },
          { name: 'streak_achieved_at', type: 'timestamptz', isNullable: true },
          { name: 'streak_started_at', type: 'timestamptz', isNullable: true },
          { name: 'month', type: 'varchar', length: '7', isNullable: false },
          { name: 'rank', type: 'int', isNullable: true },
          { name: 'last_updated_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'rankings',
      new TableIndex({ name: 'uq_rankings_user_month', columnNames: ['user_id', 'month'], isUnique: true }),
    );
    await queryRunner.createIndex(
      'rankings',
      new TableIndex({ name: 'idx_rankings_month_rank', columnNames: ['month', 'rank'] }),
    );
    await queryRunner.createForeignKey(
      'rankings',
      new TableForeignKey({
        name: 'fk_rankings_users',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('rankings', 'fk_rankings_users');
    await queryRunner.dropIndex('rankings', 'idx_rankings_month_rank');
    await queryRunner.dropIndex('rankings', 'uq_rankings_user_month');
    await queryRunner.dropTable('rankings');
  }
}
