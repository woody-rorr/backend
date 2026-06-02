import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingEntry } from './entities/ranking-entry.entity';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './ranking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RankingEntry])],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository],
  exports: [RankingService],
})
export class RankingModule {}
