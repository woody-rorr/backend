import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { QUIZ_CATEGORIES, QUIZ_DIFFICULTIES } from './create-quiz.dto';

export class QueryQuizDto {
  @ApiPropertyOptional({ enum: QUIZ_CATEGORIES })
  @IsOptional()
  @IsIn(QUIZ_CATEGORIES as unknown as string[])
  category?: string;

  @ApiPropertyOptional({ enum: QUIZ_DIFFICULTIES })
  @IsOptional()
  @IsIn(QUIZ_DIFFICULTIES as unknown as string[])
  difficulty?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class RandomQuizDto {
  @ApiPropertyOptional({ enum: QUIZ_CATEGORIES })
  @IsOptional()
  @IsIn(QUIZ_CATEGORIES as unknown as string[])
  category?: string;

  @ApiPropertyOptional({ enum: QUIZ_DIFFICULTIES })
  @IsOptional()
  @IsIn(QUIZ_DIFFICULTIES as unknown as string[])
  difficulty?: string;
}
