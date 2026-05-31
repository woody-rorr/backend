import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { QuizDifficulty } from '../entities/quiz.entity';

export class CreateQuizDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: QuizDifficulty, default: QuizDifficulty.MEDIUM })
  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;
}
