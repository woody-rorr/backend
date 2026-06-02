import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateFollowsTable1780704000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'follows',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'target_type', type: 'varchar', length: '20', isNullable: false },
        { name: 'target_id', type: 'varchar', length: '255', isNullable: false },
        { name: 'target_name', type: 'varchar', length: '255', isNullable: false },
        { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
        { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
      ],
      checks: [{ name: 'chk_follows_target_type', expression: `"target_type" IN ('league','team','player')` }],
      indices: [{ name: 'idx_follows_user_id_target_type', columnNames: ['user_id', 'target_type'] }],
      uniques: [{ name: 'uq_follows_user_id_target_type_target_id', columnNames: ['user_id', 'target_type', 'target_id'] }],
    }), true);
    await queryRunner.createForeignKey('follows', new TableForeignKey({ name: 'fk_follows_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('follows');
  }
}
