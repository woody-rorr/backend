import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateQuizzesTable1748649600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'quizzes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'difficulty',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'question_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
        checks: [
          {
            name: 'chk_quizzes_difficulty',
            expression: "difficulty IN ('EASY','MEDIUM','HARD')",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'quizzes',
      new TableIndex({
        name: 'idx_quizzes_difficulty',
        columnNames: ['difficulty'],
      }),
    );

    await queryRunner.query(
      'CREATE INDEX "idx_quizzes_created_at" ON "quizzes" ("created_at" DESC)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "idx_quizzes_created_at"');
    await queryRunner.dropIndex('quizzes', 'idx_quizzes_difficulty');
    await queryRunner.dropTable('quizzes', true);
  }
}
