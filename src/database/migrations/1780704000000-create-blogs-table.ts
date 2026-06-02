import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBlogsTable1780704000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blogs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'title', type: 'varchar', length: '200', isNullable: false },
          { name: 'content', type: 'text', isNullable: false },
          { name: 'author', type: 'varchar', length: '100', isNullable: false },
          { name: 'category', type: 'varchar', length: '100', isNullable: true },
          { name: 'tags', type: 'jsonb', isNullable: false, default: "'[]'" },
          { name: 'published', type: 'boolean', isNullable: false, default: false },
          { name: 'view_count', type: 'int', isNullable: false, default: 0 },
          { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'blogs',
      new TableIndex({ name: 'idx_blogs_category', columnNames: ['category'] }),
    );
    await queryRunner.createIndex(
      'blogs',
      new TableIndex({ name: 'idx_blogs_published', columnNames: ['published'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('blogs', 'idx_blogs_published');
    await queryRunner.dropIndex('blogs', 'idx_blogs_category');
    await queryRunner.dropTable('blogs');
  }
}
