import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEnergiesTable1780617600002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'energies',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'balance', type: 'bigint', isNullable: false, default: 0 },
          { name: 'total_purchased', type: 'bigint', isNullable: false, default: 0 },
          { name: 'total_spent', type: 'bigint', isNullable: false, default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_energies_user_id" ON "energies" ("user_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_energies_user_id"');
    await queryRunner.dropTable('energies', true);
  }
}
