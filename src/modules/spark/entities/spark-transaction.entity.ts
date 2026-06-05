import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('spark_transactions')
@Index('idx_spark_transactions_user_id', ['userId'])
export class SparkTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 증감량 (+ 적립 / - 차감). 정수 포인트.
  @Column({ name: 'amount', type: 'integer' })
  amount: number;

  // 거래 후 잔액 (ledger snapshot).
  @Column({ name: 'balance', type: 'integer' })
  balance: number;

  @Column({ name: 'reason', type: 'varchar', length: 255 })
  reason: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
