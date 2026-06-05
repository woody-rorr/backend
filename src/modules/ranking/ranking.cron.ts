import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingService } from './ranking.service';

@Injectable()
export class RankingCronService {
  private readonly logger = new Logger(RankingCronService.name);

  constructor(private readonly rankingService: RankingService) {}

  // 매일 자동 갱신 (현재 월 기준, 각 유저의 최고 streak 갱신)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRecompute(): Promise<void> {
    this.logger.log('[ranking] daily recompute started');
    await this.rankingService.recomputeCurrentPeriod();
    this.logger.log('[ranking] daily recompute finished');
  }
}
