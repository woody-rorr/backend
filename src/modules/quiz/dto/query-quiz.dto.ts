import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
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

export enum RankingPeriod {
  MONTHLY = 'monthly',
  ALL = 'all',
}

export class RankingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RankingPeriod, default: RankingPeriod.ALL })
  @IsOptional()
  @IsEnum(RankingPeriod)
  period: RankingPeriod = RankingPeriod.ALL;
}
