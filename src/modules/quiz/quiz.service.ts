import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizQueryDto } from './dto/list-quiz-query.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizRepository } from './quiz.repository';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  async create(dto: CreateQuizDto): Promise<QuizResponseDto> {
    const entity = this.quizRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      ...(dto.difficulty ? { difficulty: dto.difficulty } : {}),
    });
    const saved = await this.quizRepository.save(entity);
    return QuizResponseDto.fromEntity(saved);
  }

  async list(query: ListQuizQueryDto): Promise<{
    data: QuizResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { page, limit } = query;
    const [rows, total] = await this.quizRepository.findAndCount(page, limit);
    return {
      data: rows.map((row) => QuizResponseDto.fromEntity(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number): Promise<QuizResponseDto> {
    const entity = await this.quizRepository.findById(id);
    if (!entity) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: 'Quiz를 찾을 수 없습니다',
      });
    }
    return QuizResponseDto.fromEntity(entity);
  }

  async update(id: number, dto: UpdateQuizDto): Promise<QuizResponseDto> {
    const entity = await this.quizRepository.findById(id);
    if (!entity) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: 'Quiz를 찾을 수 없습니다',
      });
    }
    if (dto.title !== undefined) {
      entity.title = dto.title;
    }
    if (dto.description !== undefined) {
      entity.description = dto.description ?? null;
    }
    if (dto.difficulty !== undefined) {
      entity.difficulty = dto.difficulty;
    }
    const saved = await this.quizRepository.save(entity);
    return QuizResponseDto.fromEntity(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.quizRepository.findById(id);
    if (!entity) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: 'Quiz를 찾을 수 없습니다',
      });
    }
    await this.quizRepository.deleteById(id);
  }
}
