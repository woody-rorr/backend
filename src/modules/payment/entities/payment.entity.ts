import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

export type PaymentMethod = 'card' | 'bank' | 'kakao' | 'toss';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export const PAYMENT_METHODS: PaymentMethod[] = ['card', 'bank', 'kakao', 'toss'];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'completed',
  'failed',
  'cancelled',
];

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // 04-data-layer.md §5: 금액은 numeric 사용 (float 금지). TypeORM은 string으로 매핑.
  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 3, default: 'KRW' })
  currency: string;

  @Column({ type: 'varchar', length: 20 })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: PaymentStatus;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // 불변식: pending 상태에서만 승인 가능
  confirm(transactionId: string): void {
    if (this.status !== 'pending') {
      throw new HttpException(
        {
          code: 'INVALID_PAYMENT_STATE',
          message: `결제를 승인할 수 없는 상태입니다 (현재: ${this.status})`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'completed';
    this.transactionId = transactionId;
  }

  // 불변식: 이미 종결된 결제는 취소 불가
  cancel(): void {
    if (this.status === 'cancelled') {
      throw new HttpException(
        { code: 'INVALID_PAYMENT_STATE', message: '이미 취소된 결제입니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (this.status === 'failed') {
      throw new HttpException(
        { code: 'INVALID_PAYMENT_STATE', message: '실패한 결제는 취소할 수 없습니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'cancelled';
  }
}
