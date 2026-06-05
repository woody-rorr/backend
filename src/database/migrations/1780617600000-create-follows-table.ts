import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFollowsTable1780617600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'follows',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          { name: 'follower_id', type: 'uuid', isNullable: false },
          { name: 'following_id', type: 'uuid', isNullable: false },
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

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        name: 'uq_follows_follower_following',
        columnNames: ['follower_id', 'following_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        name: 'idx_follows_follower_id',
        columnNames: ['follower_id'],
      }),
    );

    await queryRunner.createIndex(
      'follows',
      new TableIndex({
        name: 'idx_follows_following_id',
        columnNames: ['following_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('follows', 'idx_follows_following_id');
    await queryRunner.dropIndex('follows', 'idx_follows_follower_id');
    await queryRunner.dropIndex('follows', 'uq_follows_follower_following');
    await queryRunner.dropTable('follows');
  }
}
