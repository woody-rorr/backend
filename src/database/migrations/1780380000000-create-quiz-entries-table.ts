import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQuizEntriesTable1780380000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quiz_entries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'match_id', type: 'varchar', length: '255', isNullable: false },
          { name: 'predicted_winner', type: 'varchar', length: '255', isNullable: false },
          { name: 'actual_winner', type: 'varchar', length: '255', isNullable: true },
          { name: 'is_correct', type: 'boolean', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
        uniques: [{ name: 'uq_quiz_entries_user_id_match_id', columnNames: ['user_id', 'match_id'] }],
        foreignKeys: [{ name: 'fk_quiz_entries_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }],
      }),
      true,
    );
    await queryRunner.createIndex('quiz_entries', new TableIndex({ name: 'idx_quiz_entries_user_id', columnNames: ['user_id'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quiz_entries', true);
  }
}
