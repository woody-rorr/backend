import { Injectable } from '@nestjs/common';
import { RankingRepository } from './ranking.repository';
import { MyRankingResponseDto, RankingListResponseDto } from './dto/ranking-response.dto';

@Injectable()
export class RankingService {
  constructor(private readonly rankingRepository: RankingRepository) {}

  private currentPeriod(): string {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${now.getUTCFullYear()}-${month}`;
  }

  async listRankings(periodInput?: string): Promise<RankingListResponseDto> {
    const period = periodInput ?? this.currentPeriod();
    const rows = await this.rankingRepository.findRankedByPeriod(period);
    return {
      rankings: rows.map((row, idx) => ({
        rank: idx + 1,
        user: { id: row.userId, nickname: row.nickname },
        longestStreak: row.longestStreak,
        streakAchievedAt: row.streakAchievedAt,
      })),
    };
  }

  async getMyRanking(
    userId: string,
    periodInput?: string,
  ): Promise<MyRankingResponseDto | null> {
    const period = periodInput ?? this.currentPeriod();
    const record = await this.rankingRepository.findByUserAndPeriod(userId, period);
    if (!record || record.longestStreak < 1) {
      return null;
    }
    const rows = await this.rankingRepository.findRankedByPeriod(period);
    const idx = rows.findIndex((r) => r.userId === userId);
    return {
      rank: idx >= 0 ? idx + 1 : null,
      period,
      longestStreak: record.longestStreak,
      streakAchievedAt: record.streakAchievedAt,
      streakStartedAt: record.streakStartedAt,
    };
  }

  // 매일 cron에서 호출. 각 유저의 현재 월 longestStreak 재계산 후 upsert.
  // TODO(spec required): streak 원천 데이터(streak 엔티티/소스)가 명세되지 않아 본문 미구현.
  // TODO(spec required): 월말 보상 — 랭킹 상위자에게 Spark 지급 로직.
  async recomputeCurrentPeriod(): Promise<void> {
    return;
  }
}
