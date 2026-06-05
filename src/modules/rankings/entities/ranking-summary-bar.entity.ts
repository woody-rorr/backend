import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ranking_summary_bars')
@Index('idx_ranking_summary_bars_snapshot_id_rank', ['snapshotId', 'rank'])
export class RankingSummaryBar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id', type: 'uuid' })
  snapshotId: string;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'varchar', length: 128 })
  label: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
