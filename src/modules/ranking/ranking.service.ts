import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyRankingQueryDto, RankingQueryDto, RankingResponseDto } from './dto/ranking.dto';
import { RankingEntity } from './entities/ranking.entity';
import { RankingRepository } from './ranking.repository';

@Injectable()
export class RankingService {
  constructor(private readonly rankingRepository: RankingRepository) {}

  /** UTC 기준 현재 월(YYYY-MM). DB는 UTC 저장(06-runtime-rules.md §10). */
  private currentMonth(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private toResponse(entity: RankingEntity): RankingResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      rank: entity.rank,
      longestStreak: entity.longestStreak,
      streakAchievedAt: entity.streakAchievedAt?.toISOString() ?? null,
      streakStartedAt: entity.streakStartedAt?.toISOString() ?? null,
      month: entity.month,
      lastUpdatedAt: entity.lastUpdatedAt?.toISOString() ?? null,
    };
  }

  /** GET /rankings — 상위 랭킹 목록 (페이지네이션). */
  async getRankings(query: RankingQueryDto): Promise<{
    data: RankingResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const month = query.month ?? this.currentMonth();
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [rows, total] = await this.rankingRepository.findTopRankings(month, page, limit);

    return {
      data: rows.map((row) => this.toResponse(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** GET /rankings/me — 내 랭킹 및 Streak 정보. */
  async getMyRanking(userId: string, query: MyRankingQueryDto): Promise<RankingResponseDto> {
    const month = query.month ?? this.currentMonth();
    const ranking = await this.rankingRepository.findByUserAndMonth(userId, month);

    if (!ranking) {
      throw new HttpException(
        {
          code: 'RANKING_NOT_FOUND',
          message: '해당 월의 랭킹 기록을 찾을 수 없습니다',
          details: { month },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toResponse(ranking);
  }
}
