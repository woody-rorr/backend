import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QuizRepository } from './quiz.repository';
import { QuizEntry, QuizPrediction, QuizResult } from './entities/quiz-entry.entity';
import { UserStreak } from './entities/user-streak.entity';
import { SparkService } from '../spark/spark.service';
import { SubmitQuizDto } from './dto/quiz.dto';

const SPARK_REWARD = 5;

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly dataSource: DataSource,
    private readonly sparkService: SparkService,
  ) {}

  async submit(userId: string, dto: SubmitQuizDto) {
    const existing = await this.quizRepository.findByUserAndMatch(userId, dto.matchId);
    if (existing) {
      throw new ConflictException({ code: 'QUIZ_ALREADY_SUBMITTED', message: '이미 예측을 제출한 경기입니다' });
    }
    const entry = this.quizRepository.createEntry({ userId, matchId: dto.matchId, prediction: dto.prediction });
    const saved = await this.quizRepository.saveEntry(entry);
    return this.toResponse(saved);
  }

  async settle(matchId: string, winner: QuizPrediction) {
    const pending = await this.quizRepository.findPendingByMatch(matchId);
    if (pending.length === 0) {
      throw new NotFoundException({ code: 'QUIZ_MATCH_NOT_FOUND', message: '정산할 예측이 없습니다' });
    }
    const settledAt = new Date();
    const settledEntries: QuizEntry[] = [];
    await this.dataSource.transaction(async (manager) => {
      const entryRepo = manager.getRepository(QuizEntry);
      const streakRepo = manager.getRepository(UserStreak);
      for (const entry of pending) {
        let streak = await streakRepo.findOne({ where: { userId: entry.userId } });
        if (!streak) { streak = streakRepo.create({ userId: entry.userId }); }
        const correct = entry.prediction === winner;
        if (correct) { streak.recordWin(settledAt); } else { streak.recordLoss(); }
        entry.settle(correct, streak.currentStreak);
        await streakRepo.save(streak);
        await entryRepo.save(entry);
        settledEntries.push(entry);
      }
    });
    for (const entry of settledEntries) {
      await this.sparkService.grant(entry.userId, SPARK_REWARD, 'QUIZ_SETTLE');
      entry.sparkGranted = true;
      await this.quizRepository.saveEntry(entry);
    }
    return { matchId, winner, settled: settledEntries.length, sparkGranted: settledEntries.length * SPARK_REWARD };
  }

  async getHistory(userId: string, page: number, limit: number) {
    const [items, total] = await this.quizRepository.findHistoryByUser(userId, page, limit);
    return { data: items.map((e) => this.toResponse(e)), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getStreak(userId: string) {
    const streak = await this.quizRepository.findStreak(userId);
    return { currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0, longestStreakStartAt: streak?.longestStreakStartAt ?? null };
  }

  async getAvailable(_userId: string) {
    return { data: [] as string[] };
  }

  private toResponse(entry: QuizEntry) {
    return { id: entry.id, matchId: entry.matchId, prediction: entry.prediction, result: entry.result, streak: entry.streak, sparkGranted: entry.sparkGranted, createdAt: entry.createdAt };
  }
}

export { QuizResult };
