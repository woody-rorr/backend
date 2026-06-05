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

export type EnergyTransactionType = 'PURCHASE' | 'BOOST_CONSUME' | 'ITEM_PURCHASE';

@Entity('energy_transactions')
export class EnergyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_energy_transactions_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'type', type: 'varchar', length: 30 })
  type: EnergyTransactionType;

  @Column({ name: 'amount', type: 'bigint', transformer: bigintTransformer })
  amount: number;

  @Column({ name: 'balance_after', type: 'bigint', transformer: bigintTransformer })
  balanceAfter: number;

  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ name: 'payment_id', type: 'varchar', length: 255, nullable: true })
  paymentId: string | null;

  @Column({ name: 'reference_id', type: 'varchar', length: 255, nullable: true })
  referenceId: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 100, nullable: true })
  referenceType: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
