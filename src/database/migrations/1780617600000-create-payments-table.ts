import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePaymentsTable1780617600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'numeric', precision: 18, scale: 2, isNullable: false },
          { name: 'currency', type: 'varchar', length: '3', default: "'KRW'", isNullable: false },
          { name: 'method', type: 'varchar', length: '20', isNullable: false },
          { name: 'status', type: 'varchar', length: '20', default: "'pending'", isNullable: false },
          { name: 'transaction_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
        checks: [
          {
            name: 'chk_payments_method',
            expression: "method IN ('card','bank','kakao','toss')",
          },
          {
            name: 'chk_payments_status',
            expression: "status IN ('pending','completed','failed','cancelled')",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'uq_payments_transaction_id',
        columnNames: ['transaction_id'],
        isUnique: true,
        where: 'transaction_id IS NOT NULL',
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'idx_payments_user_id',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('payments', 'idx_payments_user_id');
    await queryRunner.dropIndex('payments', 'uq_payments_transaction_id');
    await queryRunner.dropTable('payments');
  }
}
