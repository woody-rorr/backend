import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class QueryRankingDto {
  @ApiPropertyOptional({
    example: '2026-06',
    description: 'YYYY-MM 월 단위. 미지정 시 현재 월(UTC) 기준',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'period must be in YYYY-MM format' })
  period?: string;
}
