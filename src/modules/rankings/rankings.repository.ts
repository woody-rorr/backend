import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { RankingsSnapshot } from './entities/rankings-snapshot.entity';
import { RankingItem } from './entities/ranking-item.entity';
import { RankingMe } from './entities/ranking-me.entity';
import { RankingSummaryBar } from './entities/ranking-summary-bar.entity';
import { RankingsSummaryMeta } from './entities/rankings-summary-meta.entity';

@Injectable()
export class RankingsRepository {
  constructor(
    @InjectRepository(RankingsSnapshot)
    private readonly snapshots: Repository<RankingsSnapshot>,
    @InjectRepository(RankingItem)
    private readonly items: Repository<RankingItem>,
    @InjectRepository(RankingMe)
    private readonly mine: Repository<RankingMe>,
    @InjectRepository(RankingSummaryBar)
    private readonly bars: Repository<RankingSummaryBar>,
    @InjectRepository(RankingsSummaryMeta)
    private readonly meta: Repository<RankingsSummaryMeta>,
  ) {}

  findLatestSnapshot(period: string, metric: string): Promise<RankingsSnapshot | null> {
    return this.snapshots.findOne({
      where: { period, metric },
      order: { updatedAt: 'DESC' },
    });
  }

  findItems(snapshotId: string, page: number, limit: number): Promise<RankingItem[]> {
    return this.items.find({
      where: { snapshotId },
      order: { rank: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countItems(snapshotId: string): Promise<number> {
    return this.items.count({ where: { snapshotId } });
  }

  findMe(snapshotId: string, userId: string): Promise<RankingMe | null> {
    return this.mine.findOne({ where: { snapshotId, userId } });
  }

  findSummaryBars(snapshotId: string): Promise<RankingSummaryBar[]> {
    return this.bars.find({
      where: { snapshotId, rank: LessThanOrEqual(5) },
      order: { rank: 'ASC' },
    });
  }

  findSummaryMeta(snapshotId: string): Promise<RankingsSummaryMeta | null> {
    return this.meta.findOne({ where: { snapshotId } });
  }
}
