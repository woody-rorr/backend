import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuizStreaksTable1780380000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quiz_streaks',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'current_streak', type: 'int', default: 0, isNullable: false },
          { name: 'longest_streak', type: 'int', default: 0, isNullable: false },
          { name: 'last_match_id', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
        uniques: [{ name: 'uq_quiz_streaks_user_id', columnNames: ['user_id'] }],
        foreignKeys: [{ name: 'fk_quiz_streaks_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quiz_streaks', true);
  }
}
