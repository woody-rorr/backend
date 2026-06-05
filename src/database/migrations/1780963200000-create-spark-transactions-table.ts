import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSparkTransactionsTable1780963200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'spark_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'integer', isNullable: false },
          { name: 'balance', type: 'integer', isNullable: false },
          { name: 'reason', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'spark_transactions',
      new TableIndex({
        name: 'idx_spark_transactions_user_id',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'spark_transactions',
      'idx_spark_transactions_user_id',
    );
    await queryRunner.dropTable('spark_transactions');
  }
}
