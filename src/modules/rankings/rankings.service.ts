import { Injectable } from '@nestjs/common';
import { RankingsRepository } from './rankings.repository';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import {
  RankingEntryDto,
  RankingsResponseDto,
  RankingSummaryBarDto,
} from './dto/rankings-response.dto';
import { RankingMeResponseDto } from './dto/ranking-me-response.dto';
import { RankingItem } from './entities/ranking-item.entity';
import { RankingMe } from './entities/ranking-me.entity';

@Injectable()
export class RankingsService {
  constructor(private readonly repo: RankingsRepository) {}

  async getRankings(query: RankingsQueryDto, userId: string): Promise<RankingsResponseDto> {
    const { period, metric, page, limit } = query;

    // load: period + metric 으로 updatedAt DESC 최신 스냅샷 1건 조회
    const snapshot = await this.repo.findLatestSnapshot(period, metric);

    // 스냅샷 없으면 빈 결과 (404 금지)
    if (!snapshot) {
      return {
        items: [],
        me: null,
        summary: { bars: [], topN: 0, maxValue: 0, graphWidth: 0, isNoData: true },
        pagination: { page, limit, total: 0 },
      };
    }

    const [rows, total, meRow, barRows, metaRow] = await Promise.all([
      this.repo.findItems(snapshot.id, page, limit),
      this.repo.countItems(snapshot.id),
      this.repo.findMe(snapshot.id, userId),
      this.repo.findSummaryBars(snapshot.id),
      this.repo.findSummaryMeta(snapshot.id),
    ]);

    const items: RankingEntryDto[] = rows.map((r) => this.toEntry(r));
    const me: RankingEntryDto | null = meRow ? this.toEntry(meRow) : null;

    const bars: RankingSummaryBarDto[] = barRows.map((b) => ({
      rank: b.rank,
      value: b.value,
      label: b.label,
    }));

    return {
      items,
      me,
      summary: {
        bars,
        topN: metaRow ? metaRow.topN : bars.length,
        maxValue: metaRow ? metaRow.maxValue : 0,
        graphWidth: metaRow ? metaRow.graphWidth : 0,
        isNoData: metaRow ? metaRow.isNoData : items.length === 0,
      },
      pagination: { page, limit, total },
    };
  }

  async getMyRanking(query: RankingsQueryDto, userId: string): Promise<RankingMeResponseDto | null> {
    const { period, metric } = query;

    const snapshot = await this.repo.findLatestSnapshot(period, metric);
    if (!snapshot) {
      return null;
    }

    const meRow = await this.repo.findMe(snapshot.id, userId);
    return meRow ? this.toEntry(meRow) : null;
  }

  private toEntry(row: RankingItem | RankingMe): RankingEntryDto {
    return {
      rank: row.rank,
      userId: row.userId,
      score: row.score,
      avatarUrl: row.avatarUrl,
      username: row.username,
    };
  }
}
