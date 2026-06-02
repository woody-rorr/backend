import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { QuizRepository } from './quiz.repository';
import { QuizEntry } from './entities/quiz-entry.entity';
import { QuizStreak } from './entities/quiz-streak.entity';
import {
  SubmitQuizDto,
  SettleQuizDto,
  QuizHistoryQueryDto,
  QuizEntryResponseDto,
  QuizStreakResponseDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepo: QuizRepository,
    private readonly dataSource: DataSource,
  ) {}

  async submit(
    userId: string,
    dto: SubmitQuizDto,
  ): Promise<QuizEntryResponseDto> {
    const existing = await this.quizRepo.findEntryByUserAndMatch(
      userId,
      dto.matchId,
    );
    if (existing) {
      throw new ConflictException({
        code: 'QUIZ_ALREADY_SUBMITTED',
        message: '이미 참여한 경기입니다',
      });
    }
    const entry = this.quizRepo.createEntry({
      userId,
      matchId: dto.matchId,
      predictedWinner: dto.predictedWinner,
      actualWinner: null,
      isCorrect: null,
    });
    try {
      const saved = await this.quizRepo.saveEntry(entry);
      return this.toEntryResponse(saved);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).code === '23505') {
        throw new ConflictException({
          code: 'QUIZ_ALREADY_SUBMITTED',
          message: '이미 참여한 경기입니다',
        });
      }
      throw e;
    }
  }

  async settle(
    userId: string,
    dto: SettleQuizDto,
  ): Promise<QuizEntryResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const entryRepo = manager.getRepository(QuizEntry);
      const streakRepo = manager.getRepository(QuizStreak);

      const entry = await entryRepo.findOne({
        where: { userId, matchId: dto.matchId },
      });
      if (!entry) {
        throw new NotFoundException({
          code: 'QUIZ_ENTRY_NOT_FOUND',
          message: '해당 경기의 참여 이력을 찾을 수 없습니다',
        });
      }
      if (entry.isSettled) {
        throw new ConflictException({
          code: 'QUIZ_ALREADY_SETTLED',
          message: '이미 정산된 경기입니다',
        });
      }

      entry.settle(dto.actualWinner);
      await entryRepo.save(entry);

      let streak = await streakRepo.findOne({ where: { userId } });
      if (!streak) {
        streak = streakRepo.create({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastMatchId: null,
        });
      }
      streak.applyResult(entry.isCorrect === true, dto.matchId);
      await streakRepo.save(streak);

      return this.toEntryResponse(entry);
    });
  }

  async history(userId: string, query: QuizHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.quizRepo.findHistory(userId, page, limit);
    return {
      data: items.map((e) => this.toEntryResponse(e)),
      meta: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async getStreak(userId: string): Promise<QuizStreakResponseDto> {
    const streak = await this.quizRepo.findStreakByUser(userId);
    if (!streak) {
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastMatchId: null,
        updatedAt: null,
      };
    }
    return this.toStreakResponse(streak);
  }

  private toEntryResponse(e: QuizEntry): QuizEntryResponseDto {
    return {
      id: e.id,
      userId: e.userId,
      matchId: e.matchId,
      predictedWinner: e.predictedWinner,
      actualWinner: e.actualWinner,
      isCorrect: e.isCorrect,
      createdAt: e.createdAt.toISOString(),
    };
  }

  private toStreakResponse(s: QuizStreak): QuizStreakResponseDto {
    return {
      userId: s.userId,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      lastMatchId: s.lastMatchId,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
    };
  }
}
