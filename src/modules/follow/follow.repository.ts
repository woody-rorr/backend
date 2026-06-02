import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FollowEntity, FollowTargetType } from './entities/follow.entity';

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly repo: Repository<FollowEntity>,
  ) {}

  private scoped(manager?: EntityManager): Repository<FollowEntity> {
    return manager ? manager.getRepository(FollowEntity) : this.repo;
  }

  countByType(userId: string, targetType: FollowTargetType, manager?: EntityManager): Promise<number> {
    return this.scoped(manager).count({ where: { userId, targetType } });
  }

  findExisting(userId: string, targetType: FollowTargetType, targetId: string, manager?: EntityManager): Promise<FollowEntity | null> {
    return this.scoped(manager).findOne({ where: { userId, targetType, targetId } });
  }

  save(entity: FollowEntity, manager?: EntityManager): Promise<FollowEntity> {
    return this.scoped(manager).save(entity);
  }

  findAllByUser(userId: string): Promise<FollowEntity[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  findByUserAndType(userId: string, targetType: FollowTargetType): Promise<FollowEntity[]> {
    return this.repo.find({ where: { userId, targetType }, order: { createdAt: 'DESC' } });
  }

  async deleteOne(userId: string, targetType: FollowTargetType, targetId: string): Promise<number> {
    const result = await this.repo.delete({ userId, targetType, targetId });
    return result.affected ?? 0;
  }
}
