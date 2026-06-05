import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type SparkTransactionType =
  | 'quiz_reward'
  | 'ranking_reward'
  | 'purchase'
  | 'admin_adjust';

export const SPARK_TRANSACTION_TYPES: SparkTransactionType[] = [
  'quiz_reward',
  'ranking_reward',
  'purchase',
  'admin_adjust',
];

@Entity({ name: 'spark_transactions' })
@Index('idx_spark_transactions_user_id', ['userId'])
export class SparkTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar' })
  type: SparkTransactionType;

  @Column({ name: 'reference_id', type: 'varchar', nullable: true })
  referenceId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
