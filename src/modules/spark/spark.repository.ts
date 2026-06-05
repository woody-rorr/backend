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
    private readonly transactionRepo: Repository<SparkTransaction>,
  ) {}

  findByUserId(userId: string): Promise<Spark | null> {
    return this.sparkRepo.findOne({ where: { userId } });
  }

  findTransactions(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<[SparkTransaction[], number]> {
    return this.transactionRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
