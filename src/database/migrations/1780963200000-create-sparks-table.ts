import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateSparksTable1780963200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sparks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'amount', type: 'bigint', isNullable: false, default: 0 },
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
      }),
      true,
    );

    await queryRunner.createIndex(
      'sparks',
      new TableIndex({
        name: 'uq_sparks_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'sparks',
      new TableForeignKey({
        name: 'fk_sparks_users',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('sparks', 'fk_sparks_users');
    await queryRunner.dropIndex('sparks', 'uq_sparks_user_id');
    await queryRunner.dropTable('sparks');
  }
}