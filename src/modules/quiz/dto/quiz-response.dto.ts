import { ApiProperty } from '@nestjs/swagger';
import { Quiz } from '../entities/quiz.entity';

export class QuizResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  question: string;

  @ApiProperty({ type: [String] })
  options: string[];

  @ApiProperty()
  correctAnswer: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  difficulty: string;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;

  static fromEntity(quiz: Quiz): QuizResponseDto {
    const dto = new QuizResponseDto();
    dto.id = quiz.id;
    dto.question = quiz.question;
    dto.options = quiz.options;
    dto.correctAnswer = quiz.correctAnswer;
    dto.category = quiz.category;
    dto.difficulty = quiz.difficulty;
    dto.createdAt = quiz.createdAt ? quiz.createdAt.toISOString() : null;
    dto.updatedAt = quiz.updatedAt ? quiz.updatedAt.toISOString() : null;
    return dto;
  }
}
