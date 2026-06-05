import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SparkEntity } from './entities/spark.entity';

@Injectable()
export class SparkRepository {
  constructor(
    @InjectRepository(SparkEntity)
    private readonly repo: Repository<SparkEntity>,
  ) {}

  async findByUserId(userId: string): Promise<SparkEntity | null> {
    return this.repo.findOne({ where: { userId } });
  }

  async findByUserIdForUpdate(
    manager: EntityManager,
    userId: string,
  ): Promise<SparkEntity | null> {
    return manager.getRepository(SparkEntity).findOne({
      where: { userId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  createForUser(manager: EntityManager, userId: string): SparkEntity {
    return manager.getRepository(SparkEntity).create({ userId, amount: 0 });
  }

  async save(manager: EntityManager, entity: SparkEntity): Promise<SparkEntity> {
    return manager.getRepository(SparkEntity).save(entity);
  }
}