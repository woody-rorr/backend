import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 월말 정산 시 상위권 사용자에게 지급된 Spark 보상 이력.
 * 사용자+월 단위로 1회만 지급(멱등) → unique 제약.
 */
@Entity({ name: 'ranking_rewards' })
@Index('uq_ranking_rewards_user_month', ['userId', 'month'], { unique: true })
export class RankingRewardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** YYYY-MM 형식의 정산 월. */
  @Column({ name: 'month', type: 'varchar', length: 7 })
  month: string;

  /** 보상을 받은 순위. */
  @Column({ name: 'rank', type: 'int' })
  rank: number;

  /** 지급된 Spark 양. */
  @Column({ name: 'spark_amount', type: 'int' })
  sparkAmount: number;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
