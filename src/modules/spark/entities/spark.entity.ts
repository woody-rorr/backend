import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SparkTransaction } from './spark-transaction.entity';

@Entity('sparks')
export class Spark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_sparks_user_id', { unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'total_spark', type: 'integer', default: 0 })
  totalSpark: number;

  @OneToMany(() => SparkTransaction, (tx) => tx.spark)
  transactions: SparkTransaction[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
