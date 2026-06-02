import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQuizEntriesTable1780704000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'quiz_entries',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'match_id', type: 'varchar', length: '255', isNullable: false },
        { name: 'prediction', type: 'varchar', length: '8', isNullable: false },
        { name: 'result', type: 'varchar', length: '8', isNullable: false, default: "'PENDING'" },
        { name: 'streak', type: 'int', isNullable: false, default: 0 },
        { name: 'spark_granted', type: 'boolean', isNullable: false, default: false },
        { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
      ],
      foreignKeys: [{ name: 'fk_quiz_entries_users', columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }],
    }), true);
    await queryRunner.createIndex('quiz_entries', new TableIndex({ name: 'uq_quiz_entries_user_id_match_id', columnNames: ['user_id', 'match_id'], isUnique: true }));
    await queryRunner.createIndex('quiz_entries', new TableIndex({ name: 'idx_quiz_entries_match_id', columnNames: ['match_id'] }));
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('quiz_entries');
  }
}
