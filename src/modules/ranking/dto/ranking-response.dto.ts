import { ApiProperty } from '@nestjs/swagger';

export class RankingUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ nullable: true })
  nickname: string | null;
}

export class RankingItemDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ type: RankingUserDto })
  user: RankingUserDto;

  @ApiProperty({ example: 7 })
  longestStreak: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  streakAchievedAt: Date | null;
}

export class RankingListResponseDto {
  @ApiProperty({ type: [RankingItemDto] })
  rankings: RankingItemDto[];
}

export class MyRankingResponseDto {
  @ApiProperty({ example: 12, nullable: true })
  rank: number | null;

  @ApiProperty({ example: '2026-06' })
  period: string;

  @ApiProperty({ example: 7 })
  longestStreak: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  streakAchievedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  streakStartedAt: Date | null;
}
