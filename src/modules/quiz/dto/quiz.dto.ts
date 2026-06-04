import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { QuizPrediction } from '../entities/quiz-entry.entity';

export class SubmitQuizDto {
  @ApiProperty({ example: 'match_2026_06_02_T1_GEN', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  matchId: string;

  @ApiProperty({ enum: QuizPrediction })
  @IsEnum(QuizPrediction)
  prediction: QuizPrediction;
}

export class SettleQuizDto {
  @ApiProperty({ enum: QuizPrediction })
  @IsEnum(QuizPrediction)
  winner: QuizPrediction;
}

export class QuizHistoryQueryDto {
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
