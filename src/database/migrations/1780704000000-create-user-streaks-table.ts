import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserStreaksTable1780704000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'user_streaks',
      columns: [
        { name: 'user_id', type: 'uuid', isPrimary: true },
        { name: 'current_streak', type: 'int', isNullable: false, default: 0 },
        { name: 'longest_streak', type: 'int', isNullable: false, default: 0 },
        { name: 'longest_streak_start_at', type: 'timestamptz', isNullable: true },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
      ],
      foreignKeys: [{ name: 'fk_user_streaks_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }],
    }), true);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_streaks');
  }
}
