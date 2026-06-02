import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SparkTransaction, SparkReason } from './entities/spark-transaction.entity';
import { SparkBalance } from './entities/spark-balance.entity';

@Injectable()
export class SparkRepository {
  constructor(
    @InjectRepository(SparkTransaction)
    private readonly txRepo: Repository<SparkTransaction>,
    @InjectRepository(SparkBalance)
    private readonly balanceRepo: Repository<SparkBalance>,
  ) {}

  findBalance(userId: string): Promise<SparkBalance | null> {
    return this.balanceRepo.findOne({ where: { userId } });
  }

  findHistory(
    userId: string,
    page: number,
    limit: number,
    reason?: SparkReason,
  ): Promise<[SparkTransaction[], number]> {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId });
    if (reason) {
      qb.andWhere('t.reason = :reason', { reason });
    }
    qb.orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    return qb.getManyAndCount();
  }

  async existsLoginDailyToday(userId: string): Promise<boolean> {
    const count = await this.txRepo
      .createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere('t.reason = :reason', { reason: SparkReason.LOGIN_DAILY })
      .andWhere("(t.createdAt AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date")
      .getCount();
    return count > 0;
  }
}
