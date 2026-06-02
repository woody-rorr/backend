import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RankingEntry } from './entities/ranking-entry.entity';
import { RankingRepository, RANKING_ORDER } from './ranking.repository';
import { RankingEntryResponseDto } from './dto/ranking-entry-response.dto';

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const TOP_LIMIT = 50;
const FIXED_REWARDS: Record<number, number> = { 1: 3000, 2: 1000, 3: 700, 4: 500, 5: 400 };

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function toResponse(e: RankingEntry): RankingEntryResponseDto {
  return {
    id: e.id, userId: e.userId, period: e.period,
    longestStreak: e.longestStreak,
    streakStartedAt: e.streakStartedAt ? e.streakStartedAt.toISOString() : null,
    rank: e.rank, rewardSpark: e.rewardSpark, rewardGranted: e.rewardGranted,
    createdAt: e.createdAt.toISOString(),
  };
}

@Injectable()
export class RankingService {
  constructor(
    private readonly rankingRepository: RankingRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getRanking(period: string): Promise<RankingEntryResponseDto[]> {
    this.assertPeriod(period);
    return (await this.rankingRepository.findRankedByPeriod(period, TOP_LIMIT)).map(toResponse);
  }

  async getMyRanking(userId: string, period: string): Promise<RankingEntryResponseDto> {
    this.assertPeriod(period);
    const entry = await this.rankingRepository.findByUserAndPeriod(userId, period);
    if (!entry) throw new NotFoundException({ code: 'RANKING_NOT_FOUND', message: '해당 기간의 랭킹 정보가 없습니다' });
    return toResponse(entry);
  }

  async recalculate(period?: string): Promise<{ period: string; updated: number }> {
    const target = period ?? currentPeriod();
    this.assertPeriod(target);
    const updated = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RankingEntry);
      const entries = await repo.find({ where: { period: target }, order: RANKING_ORDER });
      entries.forEach((e, i) => e.assignRank(i + 1));
      await repo.save(entries);
      return entries.length;
    });
    return { period: target, updated };
  }

  async settle(period: string): Promise<{ period: string; settled: number }> {
    this.assertPeriod(period);
    const settled = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(RankingEntry);
      const entries = await repo.find({ where: { period }, order: RANKING_ORDER });
      if (!entries.length) throw new NotFoundException({ code: 'RANKING_NOT_FOUND', message: '정산할 랭킹 데이터가 없습니다' });
      if (entries.some((e) => e.rewardGranted)) throw new ConflictException({ code: 'RANKING_ALREADY_SETTLED', message: '이미 정산된 기간입니다' });
      const total = entries.length;
      entries.forEach((e, i) => e.grantReward(i + 1, this.computeReward(i + 1, total)));
      await repo.save(entries);
      return entries.length;
    });
    return { period, settled };
  }

  private computeReward(rank: number, total: number): number {
    if (FIXED_REWARDS[rank] !== undefined) return FIXED_REWARDS[rank];
    const pct = rank / total;
    if (pct <= 0.005) return 300;
    if (pct <= 0.03) return 200;
    if (pct <= 0.1) return 100;
    if (pct <= 0.25) return 50;
    if (pct <= 0.5) return 20;
    return 0;
  }

  private assertPeriod(period: string): void {
    if (!PERIOD_PATTERN.test(period)) throw new BadRequestException({ code: 'INVALID_PERIOD', message: 'period 형식은 YYYY-MM 이어야 합니다' });
  }
}
