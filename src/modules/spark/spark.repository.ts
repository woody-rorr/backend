import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparkTransaction } from './entities/spark-transaction.entity';

@Injectable()
export class SparkRepository {
  constructor(
    @InjectRepository(SparkTransaction)
    private readonly repo: Repository<SparkTransaction>,
  ) {}

  create(data: Partial<SparkTransaction>): SparkTransaction {
    return this.repo.create(data);
  }

  async save(tx: SparkTransaction): Promise<SparkTransaction> {
    return this.repo.save(tx);
  }

  async sumByUser(userId: string): Promise<number> {
    const raw = await this.repo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'sum')
      .where('t.userId = :userId', { userId })
      .getRawOne<{ sum: string }>();
    return Number(raw?.sum ?? 0);
  }
}
