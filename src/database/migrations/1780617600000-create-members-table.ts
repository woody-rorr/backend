import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMembersTable1780617600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'google_id', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'profile_image_url', type: 'varchar', isNullable: true },
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
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'last_login_at', type: 'timestamptz', isNullable: true },
        ],
        uniques: [
          { name: 'uq_members_google_id', columnNames: ['google_id'] },
          { name: 'uq_members_email', columnNames: ['email'] },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('members', true);
  }
}
