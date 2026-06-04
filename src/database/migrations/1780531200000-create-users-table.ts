import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1780531200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'username', type: 'varchar', length: '100', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "uq_users_email" ON "users" ("email")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "uq_users_email"');
    await queryRunner.dropTable('users', true);
  }
}
