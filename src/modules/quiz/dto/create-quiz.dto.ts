import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export const QUIZ_CATEGORIES = [
  'sports',
  'science',
  'history',
  'entertainment',
] as const;

export const QUIZ_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export class CreateQuizDto {
  @ApiProperty({ example: '대한민국의 수도는?', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @ApiProperty({ type: [String], example: ['서울', '부산', '대구', '인천'] })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  options: string[];

  @ApiProperty({ example: '서울' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  correctAnswer: string;

  @ApiProperty({ enum: QUIZ_CATEGORIES, example: 'history' })
  @IsIn(QUIZ_CATEGORIES as unknown as string[])
  category: string;

  @ApiProperty({ enum: QUIZ_DIFFICULTIES, example: 'easy' })
  @IsIn(QUIZ_DIFFICULTIES as unknown as string[])
  difficulty: string;
}
