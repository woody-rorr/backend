import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

@Entity({ name: 'sparks' })
export class Spark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'integer', default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /** 잔액 증가 (불변식: 음수 잔액 불가 — 증가는 항상 안전) */
  credit(amount: number): void {
    this.balance += amount;
  }

  /** 잔액 차감 — 부족 시 비즈니스 규칙 위반(422) */
  debit(amount: number): void {
    if (this.balance < amount) {
      throw new UnprocessableEntityException({
        code: 'INSUFFICIENT_SPARK_BALANCE',
        message: 'Spark 잔액이 부족합니다',
      });
    }
    this.balance -= amount;
  }
}
