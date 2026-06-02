import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QuizEntry } from './entities/quiz-entry.entity';
import { QuizStreak } from './entities/quiz-streak.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(QuizEntry)
    private readonly entries: Repository<QuizEntry>,
    @InjectRepository(QuizStreak)
    private readonly streaks: Repository<QuizStreak>,
  ) {}

  findEntryByUserAndMatch(userId: string, matchId: string): Promise<QuizEntry | null> {
    return this.entries.findOne({ where: { userId, matchId } });
  }

  createEntry(data: DeepPartial<QuizEntry>): QuizEntry {
    return this.entries.create(data);
  }

  saveEntry(entry: QuizEntry): Promise<QuizEntry> {
    return this.entries.save(entry);
  }

  findHistory(userId: string, page: number, limit: number): Promise<[QuizEntry[], number]> {
    return this.entries.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findStreakByUser(userId: string): Promise<QuizStreak | null> {
    return this.streaks.findOne({ where: { userId } });
  }

  saveStreak(streak: QuizStreak): Promise<QuizStreak> {
    return this.streaks.save(streak);
  }
}
