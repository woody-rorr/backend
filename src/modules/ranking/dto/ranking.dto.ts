import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

/** GET /rankings 목록 조회 쿼리 (03-api-contract.md 페이지네이션 공통). */
export class RankingQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ example: '2026-06', description: 'YYYY-MM. 미지정 시 현재 월.' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month는 YYYY-MM 형식이어야 합니다' })
  month?: string;
}

/** GET /rankings/me 전용 쿼리 (월 선택). */
export class MyRankingQueryDto {
  @ApiPropertyOptional({ example: '2026-06', description: 'YYYY-MM. 미지정 시 현재 월.' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month는 YYYY-MM 형식이어야 합니다' })
  month?: string;
}

/** 랭킹 단건 응답. */
export class RankingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ nullable: true, description: '월간 순위 (미산정 시 null)' })
  rank: number | null;

  @ApiProperty({ description: '해당 월 최장 연속 성공' })
  longestStreak: number;

  @ApiProperty({ nullable: true, description: 'ISO 8601' })
  streakAchievedAt: string | null;

  @ApiProperty({ nullable: true, description: 'ISO 8601' })
  streakStartedAt: string | null;

  @ApiProperty({ example: '2026-06' })
  month: string;

  @ApiProperty({ nullable: true, description: 'ISO 8601' })
  lastUpdatedAt: string | null;
}
