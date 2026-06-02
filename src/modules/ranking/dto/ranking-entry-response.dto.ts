import { ApiProperty } from '@nestjs/swagger';

export class RankingEntryResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) userId: string;
  @ApiProperty({ example: '2026-06' }) period: string;
  @ApiProperty({ example: 12 }) longestStreak: number;
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) streakStartedAt: string | null;
  @ApiProperty({ example: 1 }) rank: number;
  @ApiProperty({ example: 3000 }) rewardSpark: number;
  @ApiProperty({ example: false }) rewardGranted: boolean;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: string;
}
