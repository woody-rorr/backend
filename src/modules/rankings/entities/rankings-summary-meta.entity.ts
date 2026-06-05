import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rankings_summary_meta')
@Index('uq_rankings_summary_meta_snapshot_id', ['snapshotId'], { unique: true })
export class RankingsSummaryMeta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'snapshot_id', type: 'uuid' })
  snapshotId: string;

  @Column({ name: 'top_n', type: 'int' })
  topN: number;

  @Column({ name: 'max_value', type: 'int' })
  maxValue: number;

  @Column({ name: 'graph_width', type: 'int' })
  graphWidth: number;

  @Column({ name: 'is_no_data', type: 'boolean', default: false })
  isNoData: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
