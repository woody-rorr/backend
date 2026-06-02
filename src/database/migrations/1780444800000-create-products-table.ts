import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProductsTable1780444800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar', length: '200', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'numeric', precision: 12, scale: 2, isNullable: false },
          { name: 'stock', type: 'int', default: 0, isNullable: false },
          { name: 'category', type: 'varchar', length: '100', isNullable: true },
          { name: 'image_url', type: 'varchar', length: '1000', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true, isNullable: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamptz', default: 'now()', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'idx_products_category', columnNames: ['category'] }),
    );
    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'idx_products_is_active', columnNames: ['is_active'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('products', 'idx_products_is_active');
    await queryRunner.dropIndex('products', 'idx_products_category');
    await queryRunner.dropTable('products');
  }
}
