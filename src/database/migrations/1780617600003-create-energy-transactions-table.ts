import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEnergyTransactionsTable1780617600003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'energy_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'energy_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'bigint', isNullable: false },
          { name: 'type', type: 'varchar', length: '32', isNullable: false },
          { name: 'reason', type: 'varchar', length: '255', isNullable: false },
          { name: 'reference_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'reference_type', type: 'varchar', length: '64', isNullable: true },
          { name: 'payment_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'varchar', length: '16', isNullable: false, default: `'COMPLETED'` },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
        checks: [
          {
            name: 'chk_energy_transactions_type',
            expression: `"type" IN ('PURCHASE','BOOST_CONSUME','ITEM_PURCHASE','REFUND','OTHER')`,
          },
          {
            name: 'chk_energy_transactions_status',
            expression: `"status" IN ('PENDING','COMPLETED','FAILED','CANCELLED')`,
          },
        ],
        foreignKeys: [
          {
            name: 'fk_energy_transactions_energy',
            columnNames: ['energy_id'],
            referencedTableName: 'energies',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE INDEX "idx_energy_transactions_user_id_created_at" ON "energy_transactions" ("user_id", "created_at" DESC)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_energy_transactions_payment_id" ON "energy_transactions" ("payment_id") WHERE "payment_id" IS NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_energy_transactions_payment_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "idx_energy_transactions_user_id_created_at"');
    await queryRunner.dropTable('energy_transactions', true);
  }
}
