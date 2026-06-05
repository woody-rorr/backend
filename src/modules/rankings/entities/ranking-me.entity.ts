import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ranking_me')
@Index('idx_ranking_me_snapshot_id_user_id', ['snapshotId', 'userId'])
export class RankingMe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id', type: 'uuid' })
  snapshotId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int' })
  score: number;

  @Column({ name: 'avatar_url', type: 'varchar', length: 512, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 128 })
  username: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
