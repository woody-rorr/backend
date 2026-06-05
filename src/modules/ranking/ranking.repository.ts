import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RankingRecord } from './entities/ranking-record.entity';

export interface RankingRow {
  userId: string;
  nickname: string | null;
  longestStreak: number;
  streakAchievedAt: Date | null;
}

@Injectable()
export class RankingRepository {
  private readonly repo: Repository<RankingRecord>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = dataSource.getRepository(RankingRecord);
  }

  // 정렬: longestStreak DESC -> streakAchievedAt ASC -> streakStartedAt ASC -> user.createdAt ASC
  async findRankedByPeriod(period: string): Promise<RankingRow[]> {
    const rows = await this.repo
      .createQueryBuilder('r')
      .leftJoin('users', 'u', 'u.id = r.user_id')
      .select('r.user_id', 'userId')
      .addSelect('u.nickname', 'nickname')
      .addSelect('r.longest_streak', 'longestStreak')
      .addSelect('r.streak_achieved_at', 'streakAchievedAt')
      .where('r.period = :period', { period })
      .andWhere('r.longest_streak >= 1')
      .orderBy('r.longest_streak', 'DESC')
      .addOrderBy('r.streak_achieved_at', 'ASC')
      .addOrderBy('r.streak_started_at', 'ASC')
      .addOrderBy('u.created_at', 'ASC')
      .getRawMany();

    return rows.map((row) => ({
      userId: row.userId,
      nickname: row.nickname ?? null,
      longestStreak: Number(row.longestStreak),
      streakAchievedAt: row.streakAchievedAt ?? null,
    }));
  }

  findByUserAndPeriod(userId: string, period: string): Promise<RankingRecord | null> {
    return this.repo.findOne({ where: { userId, period } });
  }
}
