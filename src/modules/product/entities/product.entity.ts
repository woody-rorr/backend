import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // numeric is mapped to string by the pg driver to avoid float precision loss.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Index('idx_products_category')
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 1000, nullable: true })
  imageUrl: string | null;

  @Index('idx_products_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Invariant: stock can never go negative. Enforced inside the entity so every
   * mutation path (service / transaction) shares the same rule.
   */
  adjustStock(delta: number): void {
    const next = this.stock + delta;
    if (next < 0) {
      throw new UnprocessableEntityException({
        code: 'INSUFFICIENT_STOCK',
        message: '재고가 부족하여 요청한 수량만큼 조정할 수 없습니다',
      });
    }
    this.stock = next;
  }
}
