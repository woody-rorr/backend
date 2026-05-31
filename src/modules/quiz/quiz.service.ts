import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QueryQuizDto, RandomQuizDto } from './dto/query-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz, QuizDifficulty } from './entities/quiz.entity';
import { QuizRepository } from './quiz.repository';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateQuizDto): Promise<QuizResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const quiz = manager.create(Quiz, {
        question: dto.question,
        options: dto.options,
        correctAnswer: dto.correctAnswer,
        category: dto.category,
        difficulty: dto.difficulty as QuizDifficulty,
      });
      quiz.ensureCorrectAnswerInOptions();
      const saved = await manager.save(Quiz, quiz);
      return QuizResponseDto.fromEntity(saved);
    });
  }

  async findAll(query: QueryQuizDto): Promise<QuizResponseDto[]> {
    const quizzes = await this.quizRepository.findMany(query);
    return quizzes.map((q) => QuizResponseDto.fromEntity(q));
  }

  async findOne(id: number): Promise<QuizResponseDto> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw this.notFound(id);
    }
    return QuizResponseDto.fromEntity(quiz);
  }

  async findRandom(query: RandomQuizDto): Promise<QuizResponseDto> {
    const quiz = await this.quizRepository.findRandom(query);
    if (!quiz) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: '조건에 맞는 퀴즈를 찾을 수 없습니다',
      });
    }
    return QuizResponseDto.fromEntity(quiz);
  }

  async update(id: number, dto: UpdateQuizDto): Promise<QuizResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const quiz = await manager.findOne(Quiz, { where: { id } });
      if (!quiz) {
        throw this.notFound(id);
      }
      if (dto.question !== undefined) quiz.question = dto.question;
      if (dto.options !== undefined) quiz.options = dto.options;
      if (dto.correctAnswer !== undefined) quiz.correctAnswer = dto.correctAnswer;
      if (dto.category !== undefined) quiz.category = dto.category;
      if (dto.difficulty !== undefined) quiz.difficulty = dto.difficulty as QuizDifficulty;
      quiz.ensureCorrectAnswerInOptions();
      const saved = await manager.save(Quiz, quiz);
      return QuizResponseDto.fromEntity(saved);
    });
  }

  async remove(id: number): Promise<void> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw this.notFound(id);
    }
    await this.quizRepository.deleteById(id);
  }

  private notFound(id: number): NotFoundException {
    return new NotFoundException({
      code: 'QUIZ_NOT_FOUND',
      message: `퀴즈를 찾을 수 없습니다: ${id}`,
    });
  }
}
