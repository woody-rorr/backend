import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRankingRewardsTable1780358400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ranking_rewards',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'month', type: 'varchar', length: '7', isNullable: false },
          { name: 'rank', type: 'int', isNullable: false },
          { name: 'spark_amount', type: 'int', isNullable: false },
          { name: 'paid_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ranking_rewards',
      new TableIndex({ name: 'uq_ranking_rewards_user_month', columnNames: ['user_id', 'month'], isUnique: true }),
    );
    await queryRunner.createForeignKey(
      'ranking_rewards',
      new TableForeignKey({
        name: 'fk_ranking_rewards_users',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ranking_rewards', 'fk_ranking_rewards_users');
    await queryRunner.dropIndex('ranking_rewards', 'uq_ranking_rewards_user_month');
    await queryRunner.dropTable('ranking_rewards');
  }
}
