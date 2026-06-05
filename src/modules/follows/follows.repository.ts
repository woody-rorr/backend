import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>,
  ) {}

  find(followerId: string, followingId: string): Promise<Follow | null> {
    return this.repo.findOne({ where: { followerId, followingId } });
  }

  createFollow(followerId: string, followingId: string): Promise<Follow> {
    const follow = this.repo.create({ followerId, followingId });
    return this.repo.save(follow);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  findByFollowing(userId: string): Promise<Follow[]> {
    return this.repo.find({
      where: { followingId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByFollower(userId: string): Promise<Follow[]> {
    return this.repo.find({
      where: { followerId: userId },
      order: { createdAt: 'DESC' },
    });
  }
}
