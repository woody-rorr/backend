import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SparkRepository } from './spark.repository';
import { SparkTransaction } from './entities/spark-transaction.entity';

@Injectable()
export class SparkService {
  constructor(private readonly sparkRepo: SparkRepository) {}

  /**
   * Spark 지급 및 트랜잭션 기록.
   * Quiz settle, 랭킹 보상 등 다른 모듈에서 호출되는 진입점 (SparkModule.exports).
   */
  async grant(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<SparkTransaction> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new UnprocessableEntityException({
        code: 'INVALID_AMOUNT',
        message: '지급 수량은 양의 정수여야 합니다',
      });
    }
    const tx = this.sparkRepo.create({ userId, amount, reason });
    return this.sparkRepo.save(tx);
  }

  /** 유저의 누적 Spark 잔액 (트랜잭션 amount 합계). */
  async getBalance(userId: string): Promise<number> {
    return this.sparkRepo.sumByUser(userId);
  }
}
