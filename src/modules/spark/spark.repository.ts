import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spark } from './entities/spark.entity';
import { SparkTransaction } from './entities/spark-transaction.entity';

@Injectable()
export class SparkRepository {
  constructor(
    @InjectRepository(Spark)
    private readonly sparkRepo: Repository<Spark>,
    @InjectRepository(SparkTransaction)
    private readonly txRepo: Repository<SparkTransaction>,
  ) {}

  findAccountByUserId(userId: string): Promise<Spark | null> {
    return this.sparkRepo.findOne({ where: { userId } });
  }

  createAccount(userId: string): Promise<Spark> {
    return this.sparkRepo.save(this.sparkRepo.create({ userId, totalSpark: 0 }));
  }

  findTransactions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[SparkTransaction[], number]> {
    return this.txRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByDailyKey(dailyKey: string): Promise<SparkTransaction | null> {
    return this.txRepo.findOne({ where: { dailyKey } });
  }
}
