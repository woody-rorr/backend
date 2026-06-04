import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, QuizParticipation, QuizStreak } from './entities/quiz.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Quiz) private readonly quizzes: Repository<Quiz>,
    @InjectRepository(QuizParticipation)
    private readonly participations: Repository<QuizParticipation>,
    @InjectRepository(QuizStreak) private readonly streaks: Repository<QuizStreak>,
  ) {}

  findQuizById(id: string) {
    return this.quizzes.findOne({ where: { id } });
  }

  findAvailableQuizzes() {
    return this.quizzes
      .createQueryBuilder('q')
      .where('q.closedAt IS NULL')
      .orWhere('q.closedAt > :now', { now: new Date() })
      .orderBy('q.createdAt', 'DESC')
      .getMany();
  }

  findParticipation(quizId: string, userId: string) {
    return this.participations.findOne({ where: { quizId, userId } });
  }

  createParticipation(data: { quizId: string; userId: string; prediction: string }) {
    const entity = this.participations.create({
      quizId: data.quizId,
      userId: data.userId,
      prediction: data.prediction,
    });
    return this.participations.save(entity);
  }

  findMyParticipations(userId: string, page: number, limit: number) {
    return this.participations.findAndCount({
      where: { userId },
      order: { participatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findRankingsByPeriod(period: string) {
    return this.streaks.find({
      where: { period },
      order: { maxStreakMonthly: 'DESC' },
    });
  }

  findStreak(userId: string, period: string) {
    return this.streaks.findOne({ where: { userId, period } });
  }
}
