import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const bigintTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value === null ? 0 : Number(value)),
};

@Entity('energies')
export class Energy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_energies_user_id', { unique: true })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'balance', type: 'bigint', default: 0, transformer: bigintTransformer })
  balance: number;

  @Column({ name: 'total_purchased', type: 'bigint', default: 0, transformer: bigintTransformer })
  totalPurchased: number;

  @Column({ name: 'total_spent', type: 'bigint', default: 0, transformer: bigintTransformer })
  totalSpent: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // 불변식: 구매 금액은 양수, balance/totalPurchased 동시 증가
  purchase(amount: number): void {
    if (amount <= 0) {
      throw new Error('purchase amount must be positive');
    }
    this.balance += amount;
    this.totalPurchased += amount;
  }

  // 불변식: 잔액 부족 시 차감 거부 (false 반환). balance 감소 + totalSpent 증가.
  consume(amount: number): boolean {
    if (amount <= 0) {
      throw new Error('consume amount must be positive');
    }
    if (this.balance < amount) {
      return false;
    }
    this.balance -= amount;
    this.totalSpent += amount;
    return true;
  }
}
