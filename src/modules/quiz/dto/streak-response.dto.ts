import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StreakResponseDto {
  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiPropertyOptional({
    nullable: true,
    description: '마지막 답변 시각 (ISO 8601)',
  })
  lastAnsweredAt: string | null;
}
