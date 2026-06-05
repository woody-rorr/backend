import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

const bigintTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value === null ? 0 : parseInt(value, 10)),
};

@Entity({ name: 'sparks' })
@Index('uq_sparks_user_id', ['userId'], { unique: true })
export class SparkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'amount', type: 'bigint', default: 0, transformer: bigintTransformer })
  amount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  earn(amount: number): void {
    if (amount <= 0) {
      throw new UnprocessableEntityException({
        code: 'INVALID_SPARK_AMOUNT',
        message: 'Spark 적립 금액은 0보다 커야 합니다',
      });
    }
    this.amount += amount;
  }

  spend(amount: number): void {
    if (amount <= 0) {
      throw new UnprocessableEntityException({
        code: 'INVALID_SPARK_AMOUNT',
        message: 'Spark 차감 금액은 0보다 커야 합니다',
      });
    }
    if (this.amount < amount) {
      throw new UnprocessableEntityException({
        code: 'INSUFFICIENT_SPARK',
        message: 'Spark 잔고가 부족합니다',
      });
    }
    this.amount -= amount;
  }
}