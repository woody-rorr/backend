import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Quiz } from '../entities/quiz.entity';

const toIso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : (v as string);

export class QuizResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;

  @ApiPropertyOptional({ type: [String] })
  options?: string[];

  @ApiProperty({ description: '정답 시 지급되는 Spark' })
  sparkReward: number;

  @ApiProperty({ description: '마감 시각 (ISO 8601)' })
  deadline: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ description: '사용자가 이미 답변했는지 여부' })
  answered: boolean;

  @ApiProperty()
  createdAt: string;

  static from(quiz: Quiz, answered: boolean): QuizResponseDto {
    const dto = new QuizResponseDto();
    dto.id = quiz.id;
    dto.question = quiz.question;
    dto.options = quiz.options;
    dto.sparkReward = quiz.sparkReward;
    dto.deadline = toIso(quiz.deadline);
    dto.isActive = quiz.isActive;
    dto.answered = answered;
    dto.createdAt = toIso(quiz.createdAt);
    return dto;
  }
}
