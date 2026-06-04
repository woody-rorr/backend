import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QuizRepository } from './quiz.repository';
import { UserQuizAnswer } from './entities/user-quiz-answer.entity';
import { UserStreak } from './entities/user-streak.entity';
import { SubmitAnswerDto, AnswerResultDto } from './dto/submit-answer.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { StreakResponseDto } from './dto/streak-response.dto';
import { RankingResponseDto } from './dto/ranking-response.dto';
import {
  PaginationQueryDto,
  RankingQueryDto,
  RankingPeriod,
} from './dto/query-quiz.dto';

const toIso = (v: unknown): string | null =>
  v instanceof Date ? v.toISOString() : (v as string) ?? null;

@Injectable()
export class QuizService {
  constructor(
    private readonly repo: QuizRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getActiveQuizzes(userId: string): Promise<QuizResponseDto[]> {
    const now = new Date();
    const quizzes = await this.repo.findActive(now);
    const answered = await this.repo.findAnsweredQuizIds(
      userId,
      quizzes.map((q) => q.id),
    );
    return quizzes.map((q) => QuizResponseDto.from(q, answered.has(q.id)));
  }

  async getQuiz(userId: string, id: string): Promise<QuizResponseDto> {
    const quiz = await this.repo.findById(id);
    if (!quiz) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: '퀴즈를 찾을 수 없습니다',
      });
    }
    const existing = await this.repo.findUserAnswer(userId, id);
    return QuizResponseDto.from(quiz, !!existing);
  }

  async submitAnswer(
    userId: string,
    quizId: string,
    dto: SubmitAnswerDto,
  ): Promise<AnswerResultDto> {
    const quiz = await this.repo.findById(quizId);
    if (!quiz) {
      throw new NotFoundException({
        code: 'QUIZ_NOT_FOUND',
        message: '퀴즈를 찾을 수 없습니다',
      });
    }

    const now = new Date();
    if (quiz.deadline && now > new Date(quiz.deadline)) {
      throw new HttpException(
        { code: 'QUIZ_DEADLINE_PASSED', message: '마감된 퀴즈입니다' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const dup = await this.repo.findUserAnswer(userId, quizId);
    if (dup) {
      throw new HttpException(
        { code: 'ALREADY_ANSWERED', message: '이미 답변한 퀴즈입니다' },
        HttpStatus.CONFLICT,
      );
    }

    const isCorrect = String(quiz.correctAnswer) === String(dto.answer);
    const sparkAwarded = isCorrect ? quiz.sparkReward ?? 0 : 0;

    try {
      return await this.dataSource.transaction(async (mgr) => {
        const answer = mgr.create(UserQuizAnswer, {
          userId,
          quizId,
          answer: dto.answer,
          isCorrect,
          sparkAwarded,
        });
        const savedAnswer = await mgr.save(answer);

        let streak = await mgr.findOne(UserStreak, { where: { userId } });
        if (!streak) {
          streak = mgr.create(UserStreak, {
            userId,
            currentStreak: 0,
            longestStreak: 0,
          });
        }
        if (isCorrect) {
          streak.currentStreak += 1;
          streak.longestStreak = Math.max(
            streak.longestStreak,
            streak.currentStreak,
          );
        } else {
          streak.currentStreak = 0;
        }
        streak.lastAnsweredAt = now;
        streak.lastQuizId = quizId;
        await mgr.save(streak);

        const result = new AnswerResultDto();
        result.answerId = savedAnswer.id;
        result.isCorrect = isCorrect;
        result.sparkAwarded = sparkAwarded;
        result.currentStreak = streak.currentStreak;
        result.longestStreak = streak.longestStreak;
        return result;
      });
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new HttpException(
          { code: 'ALREADY_ANSWERED', message: '이미 답변한 퀴즈입니다' },
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  async getMyAnswers(userId: string, query: PaginationQueryDto) {
    const { page, limit } = query;
    const [rows, total] = await this.repo.findMyAnswers(userId, page, limit);
    return {
      data: rows.map((r) => ({
        id: r.id,
        quizId: r.quizId,
        answer: r.answer,
        isCorrect: r.isCorrect,
        sparkAwarded: r.sparkAwarded,
        createdAt: toIso(r.createdAt),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStreak(userId: string): Promise<StreakResponseDto> {
    const streak = await this.repo.findStreak(userId);
    const dto = new StreakResponseDto();
    dto.currentStreak = streak?.currentStreak ?? 0;
    dto.longestStreak = streak?.longestStreak ?? 0;
    dto.lastAnsweredAt = streak ? toIso(streak.lastAnsweredAt) : null;
    return dto;
  }

  async getRanking(query: RankingQueryDto) {
    const { page, limit, period } = query;
    let monthStart: Date | null = null;
    if (period === RankingPeriod.MONTHLY) {
      const now = new Date();
      monthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
      );
    }
    const { rows, total } = await this.repo.getRanking(
      period,
      page,
      limit,
      monthStart,
    );
    const data: RankingResponseDto[] = rows.map((s, idx) => {
      const dto = new RankingResponseDto();
      dto.rank = (page - 1) * limit + idx + 1;
      dto.userId = s.userId;
      dto.longestStreak = s.longestStreak;
      return dto;
    });
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
