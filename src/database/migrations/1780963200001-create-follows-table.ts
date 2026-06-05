import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateFollowsTable1780963200001 implements MigrationInterface {
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

    await queryRunner.createUniqueConstraint(
      'follows',
      new TableUnique({
        name: 'uq_follows_follower_id_following_id',
        columnNames: ['follower_id', 'following_id'],
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
    await queryRunner.dropTable('follows', true);
  }
}
