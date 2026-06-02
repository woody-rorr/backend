import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SparkReason {
  LOGIN_DAILY = 'LOGIN_DAILY',
  BOOST_PRE = 'BOOST_PRE',
  BOOST_LIVE = 'BOOST_LIVE',
  QUIZ_PARTICIPATE = 'QUIZ_PARTICIPATE',
  QUIZ_RANKING = 'QUIZ_RANKING',
  RANKING_REWARD = 'RANKING_REWARD',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

@Entity('spark_transactions')
@Index('idx_spark_transactions_user_id_created_at', ['userId', 'createdAt'])
export class SparkTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', length: 32 })
  reason: SparkReason;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
