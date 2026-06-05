import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { RankingsSnapshot } from './rankings-snapshot.entity';

@Entity('ranking_summary_bars')
export class RankingSummaryBar {
  @PrimaryColumn({ name: 'snapshot_id', type: 'bigint' })
  snapshotId: string;

  @PrimaryColumn({ name: 'bar_index', type: 'int' })
  barIndex: number;

  @Column({ name: 'user_id', type: 'varchar', length: 64, nullable: true })
  userId: string | null;

  @Column({ name: 'user_name', type: 'varchar', length: 64, nullable: true })
  userName: string | null;

  @Column({ name: 'current_streak', type: 'varchar', length: 32, nullable: true })
  currentStreak: string | null;

  @Column({ name: 'streak_long', type: 'int', nullable: true })
  streakLong: number | null;

  @Column({ name: 'streak_rate', type: 'numeric', nullable: true })
  streakRate: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ type: 'numeric', nullable: true })
  value: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => RankingsSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: RankingsSnapshot;
}
