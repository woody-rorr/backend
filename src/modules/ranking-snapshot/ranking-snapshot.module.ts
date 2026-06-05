import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingsSnapshot } from './entities/rankings-snapshot.entity';
import { RankingItem } from './entities/ranking-item.entity';
import { RankingMe } from './entities/ranking-me.entity';
import { RankingSummaryBar } from './entities/ranking-summary-bar.entity';
import { RankingsSummaryMeta } from './entities/rankings-summary-meta.entity';

const TypeOrmFeature = TypeOrmModule.forFeature([
  RankingsSnapshot,
  RankingItem,
  RankingMe,
  RankingSummaryBar,
  RankingsSummaryMeta,
]);

@Module({
  imports: [TypeOrmFeature],
  exports: [TypeOrmFeature],
})
export class RankingSnapshotModule {}
