import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Matches, Min } from 'class-validator';

export const PREDICTIONS = ['WIN', 'LOSE', 'DRAW'] as const;
export type Prediction = (typeof PREDICTIONS)[number];

export class ParticipateDto {
  @ApiProperty({ format: 'uuid', description: '참여할 퀴즈 ID' })
  @IsUUID()
  quiz_id: string;

  @ApiProperty({ enum: PREDICTIONS, description: '승패 예측' })
  @IsIn(PREDICTIONS)
  prediction: Prediction;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;
}

export class RankingQueryDto {
  @ApiPropertyOptional({ example: '2026-06', description: 'YYYY-MM 형식, 미지정 시 현재 월' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'period must be in YYYY-MM format' })
  period?: string;
}
