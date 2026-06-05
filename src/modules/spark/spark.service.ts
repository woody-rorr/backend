import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SparkRepository } from './spark.repository';
import { SparkTransaction } from './entities/spark-transaction.entity';
import { EarnSparkDto } from './dto/earn-spark.dto';
import { SparkHistoryQueryDto } from './dto/spark-history-query.dto';
import { SparkTransactionResponseDto } from './dto/spark-transaction-response.dto';

@Injectable()
export class SparkService {
  constructor(
    private readonly sparkRepository: SparkRepository,
    private readonly dataSource: DataSource,
  ) {}

  // GET /spark/balance — 인증 사용자의 현재 잔액.
  async getBalance(userId: string): Promise<{ userId: string; balance: number }> {
    const latest = await this.sparkRepository.findLatestByUserId(userId);
    return { userId, balance: latest ? latest.balance : 0 };
  }

  // POST /spark/earn — 포인트 증감 + ledger 1행 추가 (트랜잭션으로 잔액 일관성 보장).
  async earn(dto: EarnSparkDto): Promise<SparkTransactionResponseDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const latest = await this.sparkRepository.findLatestByUserId(
        dto.userId,
        manager,
      );
      const currentBalance = latest ? latest.balance : 0;
      const newBalance = currentBalance + dto.amount;

      const tx = manager.create(SparkTransaction, {
        userId: dto.userId,
        amount: dto.amount,
        balance: newBalance,
        reason: dto.reason,
      });
      return manager.save(tx);
    });

    return SparkTransactionResponseDto.fromEntity(saved);
  }

  // GET /spark/history — 인증 사용자의 거래 내역 (페이지네이션).
  async getHistory(
    userId: string,
    query: SparkHistoryQueryDto,
  ): Promise<{
    data: SparkTransactionResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const order = this.parseSortDirection(query.sort);

    const [items, total] = await this.sparkRepository.findHistory(
      userId,
      page,
      limit,
      order,
    );

    return {
      data: items.map((item) => SparkTransactionResponseDto.fromEntity(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private parseSortDirection(sort?: string): 'ASC' | 'DESC' {
    if (!sort) return 'DESC';
    const [, dir] = sort.split(':');
    return dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  }
}
