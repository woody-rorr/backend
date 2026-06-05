import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Spark } from './spark.entity';

export enum SparkTransactionType {
  LOGIN = 'LOGIN',
  FIRST_ACCESS = 'FIRST_ACCESS',
  BOOST_COMPLETE = 'BOOST_COMPLETE',
  QUIZ_COMPLETE = 'QUIZ_COMPLETE',
  REWARD = 'REWARD',
  OTHER = 'OTHER',
}

@Entity('spark_transactions')
@Index('idx_spark_transactions_user_id_created_at', ['userId', 'createdAt'])
export class SparkTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'spark_id', type: 'uuid' })
  sparkId: string;

  @ManyToOne(() => Spark, (spark) => spark.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spark_id' })
  spark: Spark;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'amount', type: 'integer' })
  amount: number;

  @Column({ name: 'type', type: 'varchar', length: 32 })
  type: SparkTransactionType;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'reference_id', type: 'varchar', length: 255, nullable: true })
  referenceId: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 64, nullable: true })
  referenceType: string | null;

  @Index('uq_spark_transactions_daily_key', { unique: true })
  @Column({ name: 'daily_key', type: 'varchar', length: 128, nullable: true })
  dailyKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
