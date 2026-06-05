import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RankingsSnapshot } from './rankings-snapshot.entity';

@Entity('ranking_items')
export class RankingItem {
  @PrimaryColumn({ name: 'snapshot_id', type: 'bigint' })
  snapshotId: string;

  @PrimaryColumn({ type: 'int' })
  rank: number;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 64 })
  nickname: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'numeric' })
  value: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => RankingsSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: RankingsSnapshot;
}
