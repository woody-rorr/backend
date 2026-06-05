import { ApiProperty } from '@nestjs/swagger';

export class StreakRankingBarDto {
  @ApiProperty({ example: 'woody', description: '사용자 표시명' })
  userName: string;

  @ApiProperty({ example: '12일', description: '현재 스트릭 표시용 문자열' })
  currentStreak: string;

  @ApiProperty({ example: 30, description: '최장 스트릭 (일수)' })
  streakLong: number;

  @ApiProperty({ example: 1.0, description: '0~1 사이 비율 (그래프 막대 비율)' })
  streakRate: number;
}

export class StreakRankingResponseDto {
  @ApiProperty({
    type: [StreakRankingBarDto],
    description: 'TOP 5 (부족하면 빈 슬롯을 빈 문자열/0으로 패딩)',
  })
  bars: StreakRankingBarDto[];

  @ApiProperty({
    example: 100,
    description: '가장 긴 streakLong 을 기준으로 한 max width (px 또는 비율)',
  })
  graphWidth: number;
}
