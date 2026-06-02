import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class RankingQueryDto {
  @ApiProperty({ example: '2026-06' })
  @IsString()
  @Matches(PERIOD_PATTERN, { message: 'period 형식은 YYYY-MM 이어야 합니다' })
  period: string;
}

export class RankingUpdateQueryDto {
  @ApiPropertyOptional({ example: '2026-06' })
  @IsOptional()
  @IsString()
  @Matches(PERIOD_PATTERN, { message: 'period 형식은 YYYY-MM 이어야 합니다' })
  period?: string;
}
