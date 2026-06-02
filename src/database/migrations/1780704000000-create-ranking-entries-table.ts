import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRankingEntriesTable1780704000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'ranking_entries',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'period', type: 'varchar', length: '7', isNullable: false },
        { name: 'longest_streak', type: 'int', isNullable: false, default: 0 },
        { name: 'streak_started_at', type: 'timestamptz', isNullable: true },
        { name: 'rank', type: 'int', isNullable: false, default: 0 },
        { name: 'reward_spark', type: 'int', isNullable: false, default: 0 },
        { name: 'reward_granted', type: 'boolean', isNullable: false, default: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
      ],
      foreignKeys: [{ name: 'fk_ranking_entries_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }],
      indices: [
        { name: 'uq_ranking_entries_user_period', columnNames: ['user_id', 'period'], isUnique: true },
        { name: 'idx_ranking_entries_period_rank', columnNames: ['period', 'rank'] },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ranking_entries', true);
  }
}
