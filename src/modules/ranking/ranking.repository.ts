import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankingEntity } from './entities/ranking.entity';

/**
 * Ranking DB 접근 격리 레이어 (scaffold_module.md §3: ORM 직접 호출만).
 * 비즈니스 규칙은 service에 둔다.
 */
@Injectable()
export class RankingRepository {
  constructor(
    @InjectRepository(RankingEntity)
    private readonly repo: Repository<RankingEntity>,
  ) {}

  /**
   * 해당 월의 상위 랭킹 목록.
   * - W1(longest_streak >= 1) 이상만 노출
   * - 1차 정렬: rank ASC (Cron 산정 값, null은 후순위)
   * - 동점/미산정 보정: longest_streak DESC → streak_achieved_at ASC → streak_started_at ASC
   */
  async findTopRankings(
    month: string,
    page: number,
    limit: number,
  ): Promise<[RankingEntity[], number]> {
    return this.repo
      .createQueryBuilder('r')
      .where('r.month = :month', { month })
      .andWhere('r.longestStreak >= :minWins', { minWins: 1 })
      .orderBy('r.rank', 'ASC', 'NULLS LAST')
      .addOrderBy('r.longestStreak', 'DESC')
      .addOrderBy('r.streakAchievedAt', 'ASC')
      .addOrderBy('r.streakStartedAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  /** 특정 사용자의 해당 월 랭킹 단건. */
  async findByUserAndMonth(userId: string, month: string): Promise<RankingEntity | null> {
    return this.repo.findOne({ where: { userId, month } });
  }
}
