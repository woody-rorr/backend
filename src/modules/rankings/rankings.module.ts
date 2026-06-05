import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { RankingsRepository } from './rankings.repository';
import { RankingsSnapshot } from './entities/rankings-snapshot.entity';
import { RankingItem } from './entities/ranking-item.entity';
import { RankingMe } from './entities/ranking-me.entity';
import { RankingSummaryBar } from './entities/ranking-summary-bar.entity';
import { RankingsSummaryMeta } from './entities/rankings-summary-meta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RankingsSnapshot,
      RankingItem,
      RankingMe,
      RankingSummaryBar,
      RankingsSummaryMeta,
    ]),
  ],
  controllers: [RankingsController],
  providers: [RankingsService, RankingsRepository],
  exports: [RankingsService],
})
export class RankingsModule {}
