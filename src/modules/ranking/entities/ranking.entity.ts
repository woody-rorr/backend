import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 사용자별·월별 최장 연속 성공(Longest Streak) 기록 및 월간 순위.
 * 02-domain-model.md 공통 규약: uuid PK + created_at/updated_at 필수.
 */
@Entity({ name: 'rankings' })
@Index('uq_rankings_user_month', ['userId', 'month'], { unique: true })
@Index('idx_rankings_month_rank', ['month', 'rank'])
export class RankingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** 해당 월의 최장 연속 성공 횟수. W1(>=1) 이상만 랭킹 기록 대상. */
  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number;

  /** Longest Streak 달성 시각. 동점 처리 1순위(빠른 쪽 우선). */
  @Column({ name: 'streak_achieved_at', type: 'timestamptz', nullable: true })
  streakAchievedAt: Date | null;

  /** Longest Streak 시작 시각. 동점 처리 2순위(빠른 쪽 우선). */
  @Column({ name: 'streak_started_at', type: 'timestamptz', nullable: true })
  streakStartedAt: Date | null;

  /** YYYY-MM 형식의 집계 월. */
  @Column({ name: 'month', type: 'varchar', length: 7 })
  month: string;

  /** 월간 순위. Cron이 갱신하며, 미산정 시 null. */
  @Column({ name: 'rank', type: 'int', nullable: true })
  rank: number | null;

  @Column({ name: 'last_updated_at', type: 'timestamptz', nullable: true })
  lastUpdatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
