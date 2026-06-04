import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { UserQuizAnswer } from './entities/user-quiz-answer.entity';
import { UserStreak } from './entities/user-streak.entity';
import { RankingPeriod } from './dto/query-quiz.dto';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
    @InjectRepository(UserQuizAnswer)
    private readonly answerRepo: Repository<UserQuizAnswer>,
    @InjectRepository(UserStreak)
    private readonly streakRepo: Repository<UserStreak>,
  ) {}

  findActive(now: Date): Promise<Quiz[]> {
    return this.quizRepo.find({
      where: { isActive: true, deadline: MoreThan(now) },
      order: { deadline: 'ASC' },
    });
  }

  findById(id: string): Promise<Quiz | null> {
    return this.quizRepo.findOne({ where: { id } });
  }

  findUserAnswer(
    userId: string,
    quizId: string,
  ): Promise<UserQuizAnswer | null> {
    return this.answerRepo.findOne({ where: { userId, quizId } });
  }

  async findAnsweredQuizIds(
    userId: string,
    quizIds: string[],
  ): Promise<Set<string>> {
    if (quizIds.length === 0) return new Set<string>();
    const rows = await this.answerRepo.find({
      where: { userId, quizId: In(quizIds) },
      select: ['quizId'],
    });
    return new Set(rows.map((r) => r.quizId));
  }

  findMyAnswers(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[UserQuizAnswer[], number]> {
    return this.answerRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findStreak(userId: string): Promise<UserStreak | null> {
    return this.streakRepo.findOne({ where: { userId } });
  }

  async getRanking(
    period: RankingPeriod,
    page: number,
    limit: number,
    monthStart: Date | null,
  ): Promise<{ rows: UserStreak[]; total: number }> {
    const qb = this.streakRepo
      .createQueryBuilder('s')
      .orderBy('s.longestStreak', 'DESC')
      .addOrderBy('s.updatedAt', 'ASC');
    if (period === RankingPeriod.MONTHLY && monthStart) {
      qb.where('s.lastAnsweredAt >= :monthStart', { monthStart });
    }
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return { rows, total };
  }
}
