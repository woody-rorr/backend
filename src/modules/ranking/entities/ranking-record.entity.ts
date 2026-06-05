import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ranking_records')
@Index('uq_ranking_records_user_id_period', ['userId', 'period'], { unique: true })
@Index('idx_ranking_records_period_longest_streak', [
  'period',
  'longestStreak',
  'streakAchievedAt',
  'streakStartedAt',
])
export class RankingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'period', type: 'varchar', length: 7 })
  period: string;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number;

  @Column({ name: 'streak_achieved_at', type: 'timestamptz', nullable: true })
  streakAchievedAt: Date | null;

  @Column({ name: 'streak_started_at', type: 'timestamptz', nullable: true })
  streakStartedAt: Date | null;

  @Column({ name: 'last_updated_at', type: 'timestamptz', default: () => 'now()' })
  lastUpdatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
