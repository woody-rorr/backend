import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ranking_entries')
@Index('uq_ranking_entries_user_period', ['userId', 'period'], { unique: true })
@Index('idx_ranking_entries_period_rank', ['period', 'rank'])
export class RankingEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 7 })
  period: string;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number;

  @Column({ name: 'streak_started_at', type: 'timestamptz', nullable: true })
  streakStartedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @Column({ name: 'reward_spark', type: 'int', default: 0 })
  rewardSpark: number;

  @Column({ name: 'reward_granted', type: 'boolean', default: false })
  rewardGranted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  grantReward(rank: number, rewardSpark: number): void {
    if (this.rewardGranted) throw new Error('RankingEntry already settled');
    this.rank = rank;
    this.rewardSpark = rewardSpark;
    this.rewardGranted = true;
  }

  assignRank(rank: number): void {
    this.rank = rank;
  }
}
