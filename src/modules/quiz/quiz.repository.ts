import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizEntry, QuizResult } from './entities/quiz-entry.entity';
import { UserStreak } from './entities/user-streak.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(QuizEntry)
    private readonly entries: Repository<QuizEntry>,
    @InjectRepository(UserStreak)
    private readonly streaks: Repository<UserStreak>,
  ) {}

  findByUserAndMatch(userId: string, matchId: string): Promise<QuizEntry | null> {
    return this.entries.findOne({ where: { userId, matchId } });
  }

  createEntry(data: Partial<QuizEntry>): QuizEntry {
    return this.entries.create(data);
  }

  saveEntry(entry: QuizEntry): Promise<QuizEntry> {
    return this.entries.save(entry);
  }

  findPendingByMatch(matchId: string): Promise<QuizEntry[]> {
    return this.entries.find({ where: { matchId, result: QuizResult.PENDING } });
  }

  findHistoryByUser(userId: string, page: number, limit: number): Promise<[QuizEntry[], number]> {
    return this.entries.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findStreak(userId: string): Promise<UserStreak | null> {
    return this.streaks.findOne({ where: { userId } });
  }

  async findSubmittedMatchIds(userId: string): Promise<string[]> {
    const rows = await this.entries.find({ where: { userId }, select: { matchId: true } });
    return rows.map((r) => r.matchId);
  }
}
