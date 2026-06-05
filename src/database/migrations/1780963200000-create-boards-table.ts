import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * boards 테이블 생성.
 * extra_spec: id(자동증가), title(필수), content(필수), author(필수),
 *             createdAt(자동), updatedAt(자동).
 * 네이밍: snake_case 복수형 (04-data-layer.md §4).
 */
export class CreateBoardsTable1780963200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'boards',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'author', type: 'varchar', length: '100', isNullable: false },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('boards', true);
  }
}
