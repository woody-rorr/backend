import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QuizRepository } from './quiz.repository';
import { ParticipateDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly repo: QuizRepository) {}

  private currentPeriod(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async participate(userId: string, dto: ParticipateDto) {
    const quiz = await this.repo.findQuizById(dto.quiz_id);
    if (!quiz) {
      throw new NotFoundException({ code: 'QUIZ_NOT_FOUND', message: '퀴즈를 찾을 수 없습니다' });
    }
    if (quiz.closedAt && quiz.closedAt.getTime() <= Date.now()) {
      throw new UnprocessableEntityException({ code: 'QUIZ_CLOSED', message: '마감된 퀴즈입니다' });
    }
    const existing = await this.repo.findParticipation(dto.quiz_id, userId);
    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_PARTICIPATED',
        message: '이미 참여한 퀴즈입니다',
      });
    }
    const saved = await this.repo.createParticipation({
      quizId: dto.quiz_id,
      userId,
      prediction: dto.prediction,
    });
    return {
      participation_id: saved.id,
      quiz_id: saved.quizId,
      prediction: saved.prediction,
      participated_at: saved.participatedAt,
    };
  }

  async getAvailableQuizzes() {
    const quizzes = await this.repo.findAvailableQuizzes();
    return {
      quizzes: quizzes.map((q) => ({
        id: q.id,
        match_id: q.matchId,
        created_at: q.createdAt,
        closed_at: q.closedAt,
      })),
    };
  }

  async getMyParticipations(userId: string, page: number, limit: number) {
    const [items, total] = await this.repo.findMyParticipations(userId, page, limit);
    return {
      participations: items.map((p) => ({
        id: p.id,
        quiz_id: p.quizId,
        prediction: p.prediction,
        is_correct: p.isCorrect,
        participated_at: p.participatedAt,
      })),
      total,
    };
  }

  async getRanking(period?: string) {
    const target = period ?? this.currentPeriod();
    const streaks = await this.repo.findRankingsByPeriod(target);
    return {
      rankings: streaks.map((s, index) => ({
        user_id: s.userId,
        max_streak: s.maxStreakMonthly,
        rank: index + 1,
      })),
      period: target,
    };
  }

  async getMyStreak(userId: string) {
    const period = this.currentPeriod();
    const streak = await this.repo.findStreak(userId, period);
    return {
      current_streak: streak?.currentStreak ?? 0,
      max_streak_monthly: streak?.maxStreakMonthly ?? 0,
      last_updated: streak?.lastUpdated ?? null,
    };
  }
}
