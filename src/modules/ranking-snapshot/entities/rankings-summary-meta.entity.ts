import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { RankingsSnapshot } from './rankings-snapshot.entity';

@Entity('rankings_summary_meta')
export class RankingsSummaryMeta {
  @PrimaryColumn({ name: 'snapshot_id', type: 'bigint' })
  snapshotId: string;

  @Column({ name: 'top_n', type: 'int' })
  topN: number;

  @Column({ name: 'max_value', type: 'numeric', nullable: true })
  maxValue: string | null;

  @Column({ name: 'graph_width', type: 'int', nullable: true })
  graphWidth: number | null;

  @Column({ name: 'is_no_data', type: 'boolean', default: false })
  isNoData: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => RankingsSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: RankingsSnapshot;
}
