import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRankingRecordsTable1780963200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ranking_records',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'period', type: 'varchar', length: '7', isNullable: false },
          { name: 'longest_streak', type: 'int', isNullable: false, default: 0 },
          { name: 'streak_achieved_at', type: 'timestamptz', isNullable: true },
          { name: 'streak_started_at', type: 'timestamptz', isNullable: true },
          { name: 'last_updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ranking_records',
      new TableIndex({
        name: 'uq_ranking_records_user_id_period',
        columnNames: ['user_id', 'period'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'ranking_records',
      new TableIndex({
        name: 'idx_ranking_records_period_longest_streak',
        columnNames: ['period', 'longest_streak', 'streak_achieved_at', 'streak_started_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'ranking_records',
      new TableForeignKey({
        name: 'fk_ranking_records_users',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ranking_records', 'fk_ranking_records_users');
    await queryRunner.dropIndex('ranking_records', 'idx_ranking_records_period_longest_streak');
    await queryRunner.dropIndex('ranking_records', 'uq_ranking_records_user_id_period');
    await queryRunner.dropTable('ranking_records');
  }
}
