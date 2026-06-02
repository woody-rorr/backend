import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, MoreThanOrEqual, Repository } from 'typeorm';
import { RankingEntry } from './entities/ranking-entry.entity';

export const RANKING_ORDER: FindOptionsOrder<RankingEntry> = {
  longestStreak: 'DESC',
  streakStartedAt: 'ASC',
  createdAt: 'ASC',
};

@Injectable()
export class RankingRepository {
  constructor(
    @InjectRepository(RankingEntry)
    private readonly repo: Repository<RankingEntry>,
  ) {}

  findRankedByPeriod(period: string, limit: number): Promise<RankingEntry[]> {
    return this.repo.find({
      where: { period, longestStreak: MoreThanOrEqual(1) },
      order: RANKING_ORDER,
      take: limit,
    });
  }

  findByUserAndPeriod(userId: string, period: string): Promise<RankingEntry | null> {
    return this.repo.findOne({ where: { userId, period } });
  }
}
