import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { RankingsSnapshot } from './rankings-snapshot.entity';

@Entity('ranking_me')
export class RankingMe {
  @PrimaryColumn({ name: 'snapshot_id', type: 'bigint' })
  snapshotId: string;

  @Column({ type: 'int', nullable: true })
  rank: number | null;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 64 })
  nickname: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'numeric', nullable: true })
  value: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => RankingsSnapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot: RankingsSnapshot;
}
