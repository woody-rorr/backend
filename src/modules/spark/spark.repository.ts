import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SparkTransaction } from './entities/spark-transaction.entity';

@Injectable()
export class SparkRepository extends Repository<SparkTransaction> {
  constructor(private readonly dataSource: DataSource) {
    super(SparkTransaction, dataSource.createEntityManager());
  }

  // 사용자의 가장 최근 거래 (= 현재 잔액 출처).
  async findLatestByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<SparkTransaction | null> {
    const repo = manager ? manager.getRepository(SparkTransaction) : this;
    return repo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findHistory(
    userId: string,
    page: number,
    limit: number,
    order: 'ASC' | 'DESC',
  ): Promise<[SparkTransaction[], number]> {
    return this.findAndCount({
      where: { userId },
      order: { createdAt: order },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
