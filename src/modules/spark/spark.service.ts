import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Spark } from './entities/spark.entity';
import {
  SparkTransaction,
  SparkTransactionType,
} from './entities/spark-transaction.entity';
import { SparkRepository } from './spark.repository';

@Injectable()
export class SparkService {
  constructor(
    private readonly sparkRepository: SparkRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /** 잔액 조회 — Spark row 없으면 0 */
  async getBalance(userId: string): Promise<number> {
    const spark = await this.sparkRepository.findByUserId(userId);
    return spark ? spark.balance : 0;
  }

  /** 잔액 증가 + 거래 기록 (pessimistic_write 락) */
  async addSpark(
    userId: string,
    amount: number,
    type: SparkTransactionType,
    referenceId?: string,
  ): Promise<Spark> {
    return this.dataSource.transaction(async (manager) => {
      let spark = await manager.findOne(Spark, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!spark) {
        spark = manager.create(Spark, { userId, balance: 0 });
      }
      spark.credit(amount);
      const saved = await manager.save(spark);
      const tx = manager.create(SparkTransaction, {
        userId,
        amount,
        type,
        referenceId: referenceId ?? null,
      });
      await manager.save(tx);
      return saved;
    });
  }

  /** 잔액 차감 + 거래 기록 (pessimistic_write 락, 부족 시 422) */
  async deductSpark(
    userId: string,
    amount: number,
    type: SparkTransactionType,
  ): Promise<Spark> {
    return this.dataSource.transaction(async (manager) => {
      const spark =
        (await manager.findOne(Spark, {
          where: { userId },
          lock: { mode: 'pessimistic_write' },
        })) ?? manager.create(Spark, { userId, balance: 0 });
      spark.debit(amount);
      const saved = await manager.save(spark);
      const tx = manager.create(SparkTransaction, {
        userId,
        amount: -amount,
        type,
        referenceId: null,
      });
      await manager.save(tx);
      return saved;
    });
  }

  /** 거래 내역 페이지네이션 */
  async getTransactions(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: SparkTransaction[]; total: number }> {
    const [items, total] = await this.sparkRepository.findTransactions(
      userId,
      limit,
      offset,
    );
    return { items, total };
  }
}
