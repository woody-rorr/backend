import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>,
  ) {}

  findOne(followerId: string, followingId: string): Promise<Follow | null> {
    return this.repo.findOne({ where: { followerId, followingId } });
  }

  createEntity(followerId: string, followingId: string): Follow {
    return this.repo.create({ followerId, followingId });
  }

  save(follow: Follow): Promise<Follow> {
    return this.repo.save(follow);
  }

  async deleteByPair(followerId: string, followingId: string): Promise<number> {
    const result = await this.repo.delete({ followerId, followingId });
    return result.affected ?? 0;
  }

  findFollowers(followingId: string): Promise<Follow[]> {
    return this.repo.find({
      where: { followingId },
      order: { createdAt: 'DESC' },
    });
  }

  findFollowings(followerId: string): Promise<Follow[]> {
    return this.repo.find({
      where: { followerId },
      order: { createdAt: 'DESC' },
    });
  }

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { followerId, followingId } });
    return count > 0;
  }
}
