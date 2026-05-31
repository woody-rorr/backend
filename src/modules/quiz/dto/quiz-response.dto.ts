import { ApiProperty } from '@nestjs/swagger';
import { QuizDifficulty, QuizEntity } from '../entities/quiz.entity';

export class QuizResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: QuizDifficulty })
  difficulty: QuizDifficulty;

  @ApiProperty()
  questionCount: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(entity: QuizEntity): QuizResponseDto {
    const dto = new QuizResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description ?? null;
    dto.difficulty = entity.difficulty;
    dto.questionCount = entity.questionCount;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
