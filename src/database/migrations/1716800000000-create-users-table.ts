import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1716800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          { name: 'password_hash', type: 'varchar', length: '255', isNullable: false },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'roles', type: 'jsonb', isNullable: false, default: "'[]'::jsonb" },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'uq_users_email', columnNames: ['email'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'uq_users_email');
    await queryRunner.dropTable('users');
  }
}
