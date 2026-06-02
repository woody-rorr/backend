import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { SparkEntity, SparkReason } from './entities/spark.entity';
import { SparkLevelEntity } from './entities/spark-level.entity';

@Injectable()
export class SparkRepository {
  constructor(
    @InjectRepository(SparkEntity) private readonly sparkRepo: Repository<SparkEntity>,
    @InjectRepository(SparkLevelEntity) private readonly levelRepo: Repository<SparkLevelEntity>,
  ) {}

  findHistory(userId: string, page: number, limit: number): Promise<[SparkEntity[], number]> {
    return this.sparkRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findLevel(userId: string): Promise<SparkLevelEntity | null> {
    return this.levelRepo.findOne({ where: { userId } });
  }

  countByReasonSince(userId: string, reason: SparkReason, since: Date): Promise<number> {
    return this.sparkRepo.count({ where: { userId, reason, createdAt: MoreThanOrEqual(since) } });
  }
}
