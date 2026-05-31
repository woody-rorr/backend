import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QueryQuizDto } from './dto/query-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizEntity } from './entities/quiz.entity';
import { QuizRepository } from './quiz.repository';

export interface PaginatedQuizzes {
  data: QuizResponseDto[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateQuizDto): Promise<QuizResponseDto> {
    const saved = await this.dataSource.transaction(async () => {
      const entity = this.quizRepository.create({
        title: dto.title,
        description: dto.description ?? null,
        difficulty: dto.difficulty,
      });
      return this.quizRepository.save(entity);
    });
    return QuizResponseDto.fromEntity(saved);
  }

  async findAll(query: QueryQuizDto): Promise<PaginatedQuizzes> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: FindOptionsWhere<QuizEntity> = query.difficulty
      ? { difficulty: query.difficulty }
      : {};
    const order = this.parseSort(query.sort);
    const [rows, total] = await this.quizRepository.findAndCount({
      where,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: rows.map((r) => QuizResponseDto.fromEntity(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<QuizResponseDto> {
    const entity = await this.quizRepository.findById(id);
    if (!entity) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: '퀴즈를 찾을 수 없습니다',
      });
    }
    return QuizResponseDto.fromEntity(entity);
  }

  async update(id: string, dto: UpdateQuizDto): Promise<QuizResponseDto> {
    const saved = await this.dataSource.transaction(async () => {
      const entity = await this.quizRepository.findById(id);
      if (!entity) {
        throw new NotFoundException({
          code: 'QUIZ_NOT_FOUND',
          message: '퀴즈를 찾을 수 없습니다',
        });
      }
      if (dto.title !== undefined) entity.title = dto.title;
      if (dto.description !== undefined) {
        entity.description = dto.description ?? null;
      }
      if (dto.difficulty !== undefined) entity.difficulty = dto.difficulty;
      if (dto.isActive !== undefined) entity.isActive = dto.isActive;
      return this.quizRepository.save(entity);
    });
    return QuizResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.transaction(async () => {
      const affected = await this.quizRepository.deleteById(id);
      if (affected === 0) {
        throw new NotFoundException({
          code: 'QUIZ_NOT_FOUND',
          message: '퀴즈를 찾을 수 없습니다',
        });
      }
    });
  }

  private parseSort(sort?: string): FindOptionsOrder<QuizEntity> {
    const fallback: FindOptionsOrder<QuizEntity> = { createdAt: 'DESC' };
    if (!sort) {
      return fallback;
    }
    const [field, dir] = sort.split(':');
    const direction = dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const allowed: Record<string, keyof QuizEntity> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      title: 'title',
    };
    const column = allowed[field];
    if (!column) {
      return fallback;
    }
    return { [column]: direction } as FindOptionsOrder<QuizEntity>;
  }
}
