import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparkTransaction } from './spark.entity';

@Injectable()
export class SparkService {
  constructor(
    @InjectRepository(SparkTransaction)
    private readonly sparkRepo: Repository<SparkTransaction>,
  ) {}

  async addSpark(userId: string, amount: number, reason: string): Promise<void> {
    await this.sparkRepo.save({
      userId,
      amount,
      reason,
    });
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.sparkRepo
      .createQueryBuilder('spark')
      .select('SUM(spark.amount)', 'total')
      .where('spark.userId = :userId', { userId })
      .getRawOne();
    return result?.total || 0;
  }
}
