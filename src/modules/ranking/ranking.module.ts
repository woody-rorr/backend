import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './ranking.repository';
import { RankingCronService } from './ranking.cron';
import { RankingRecord } from './entities/ranking-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RankingRecord])],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, RankingCronService],
  exports: [RankingService],
})
export class RankingModule {}
