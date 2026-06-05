import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rankings_snapshot')
@Index('idx_rankings_snapshot_period_metric_updated', ['period', 'metric', 'updatedAt'])
export class RankingsSnapshot {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 16 })
  period: string;

  @Column({ type: 'varchar', length: 32 })
  metric: string;

  @Column({ name: 'top_limit', type: 'int' })
  topLimit: number;

  @Column({ type: 'varchar', length: 128, nullable: true })
  cursor: string | null;

  @Column({ name: 'next_cursor', type: 'varchar', length: 128, nullable: true })
  nextCursor: string | null;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
