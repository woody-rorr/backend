import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

/** numeric(12,2) is returned as string by pg driver -> normalize to number */
const decimalTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};

@Entity('orders')
@Index('idx_orders_user_id', ['userId'])
@Index('idx_orders_status', ['status'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_orders_order_number', { unique: true })
  @Column({ name: 'order_number', type: 'varchar', length: 32 })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  items: OrderItem[];

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'shipping_address', type: 'varchar', length: 500 })
  shippingAddress: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  notes: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // ----------------------------------------------------------------
  // Business behavior. Invariants are enforced HERE (not in service),
  // so the state machine cannot be bypassed by any caller.
  //   pending -> paid -> shipped -> delivered
  //   pending|paid -> cancelled
  // ----------------------------------------------------------------

  recalculateTotal(): void {
    const sum = this.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    this.totalAmount = Number(sum.toFixed(2));
  }

  private assertMutable(): void {
    if (this.status !== 'pending') {
      throw new HttpException(
        {
          code: 'INVALID_ORDER_STATE',
          message: `pending 상태의 주문만 수정할 수 있습니다 (현재: ${this.status})`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  updateDetails(fields: { shippingAddress?: string; notes?: string | null }): void {
    this.assertMutable();
    if (fields.shippingAddress !== undefined) this.shippingAddress = fields.shippingAddress;
    if (fields.notes !== undefined) this.notes = fields.notes;
  }

  pay(): void {
    if (this.status !== 'pending') {
      throw new HttpException(
        {
          code: 'INVALID_ORDER_STATE',
          message: `pending 상태에서만 결제할 수 있습니다 (현재: ${this.status})`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'paid';
    this.paidAt = new Date();
  }

  markShipped(): void {
    if (this.status !== 'paid') {
      throw new HttpException(
        { code: 'INVALID_ORDER_STATE', message: 'paid 상태에서만 배송할 수 있습니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'shipped';
  }

  markDelivered(): void {
    if (this.status !== 'shipped') {
      throw new HttpException(
        { code: 'INVALID_ORDER_STATE', message: 'shipped 상태에서만 배송완료 처리할 수 있습니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'delivered';
  }

  cancel(): void {
    if (this.status === 'cancelled') {
      throw new HttpException(
        { code: 'ORDER_ALREADY_CANCELLED', message: '이미 취소된 주문입니다' },
        HttpStatus.CONFLICT,
      );
    }
    if (this.status !== 'pending' && this.status !== 'paid') {
      throw new HttpException(
        {
          code: 'INVALID_ORDER_STATE',
          message: `pending 또는 paid 상태의 주문만 취소할 수 있습니다 (현재: ${this.status})`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    this.status = 'cancelled';
    this.cancelledAt = new Date();
  }
}
