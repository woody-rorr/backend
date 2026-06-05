import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSparkTransactionsTable1780617600001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'spark_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'spark_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'bigint', isNullable: false },
          { name: 'type', type: 'varchar', length: '32', isNullable: false },
          { name: 'reason', type: 'varchar', length: '255', isNullable: false },
          { name: 'reference_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'reference_type', type: 'varchar', length: '64', isNullable: true },
          { name: 'daily_key', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
        checks: [
          {
            name: 'chk_spark_transactions_type',
            expression: `"type" IN ('LOGIN','FIRST_ACCESS','BOOST_COMPLETE','QUIZ_COMPLETE','REWARD','OTHER')`,
          },
        ],
        foreignKeys: [
          {
            name: 'fk_spark_transactions_spark',
            columnNames: ['spark_id'],
            referencedTableName: 'sparks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE INDEX "idx_spark_transactions_user_id_created_at" ON "spark_transactions" ("user_id", "created_at" DESC)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_spark_transactions_daily_key" ON "spark_transactions" ("daily_key") WHERE "daily_key" IS NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_spark_transactions_daily_key"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_spark_transactions_user_id_created_at"');
    await queryRunner.dropTable('spark_transactions', true);
  }
}
