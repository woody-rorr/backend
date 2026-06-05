import { Injectable } from '@nestjs/common';
import {
  StreakRankingBarDto,
  StreakRankingResponseDto,
} from './dto/streak-ranking.response.dto';

const TOP_N = 5;

// 데이터 소스(user/streak 집계)가 아직 없으므로 mock 5건 반환.
const MOCK_BARS: StreakRankingBarDto[] = [
  { userName: 'woody', currentStreak: '12일', streakLong: 30, streakRate: 1.0 },
  { userName: 'noah', currentStreak: '9일', streakLong: 25, streakRate: 0.83 },
  { userName: 'erin', currentStreak: '7일', streakLong: 20, streakRate: 0.66 },
  { userName: 'ella', currentStreak: '5일', streakLong: 15, streakRate: 0.5 },
  { userName: 'finn', currentStreak: '3일', streakLong: 10, streakRate: 0.33 },
];

const MOCK_GRAPH_WIDTH = 100;

@Injectable()
export class RankingService {
  getStreakRanking(): StreakRankingResponseDto {
    const bars = this.padBars(MOCK_BARS);
    return { bars, graphWidth: MOCK_GRAPH_WIDTH };
  }

  // TOP_N 길이 보장 — 부족하면 빈 슬롯(빈 문자열/0)으로 패딩.
  private padBars(source: StreakRankingBarDto[]): StreakRankingBarDto[] {
    const bars: StreakRankingBarDto[] = source.slice(0, TOP_N);
    while (bars.length < TOP_N) {
      bars.push({ userName: '', currentStreak: '', streakLong: 0, streakRate: 0 });
    }
    return bars;
  }
}
