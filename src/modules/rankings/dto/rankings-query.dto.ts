import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum RankingPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

export enum RankingMetric {
  SCORE = 'score',
  WINS = 'wins',
  COMPLETIONS = 'completions',
}

export class RankingsQueryDto {
  @ApiPropertyOptional({ enum: RankingPeriod, default: RankingPeriod.ALL })
  @IsOptional()
  @IsEnum(RankingPeriod)
  period: RankingPeriod = RankingPeriod.ALL;

  @ApiPropertyOptional({ enum: RankingMetric, default: RankingMetric.SCORE })
  @IsOptional()
  @IsEnum(RankingMetric)
  metric: RankingMetric = RankingMetric.SCORE;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
