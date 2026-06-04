import { ApiProperty } from '@nestjs/swagger';

export class RankingResponseDto {
  @ApiProperty({ description: '순위 (1부터)' })
  rank: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  longestStreak: number;
}
