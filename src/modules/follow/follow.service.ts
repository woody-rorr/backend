import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowRepository } from './follow.repository';
import { Follow } from './entities/follow.entity';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowCheckResponseDto } from './dto/follow-check-response.dto';

@Injectable()
export class FollowService {
  constructor(private readonly followRepo: FollowRepository) {}

  async create(followerId: string, followingId: string): Promise<FollowResponseDto> {
    if (followerId === followingId) {
      throw new BadRequestException({
        code: 'CANNOT_FOLLOW_SELF',
        message: '자기 자신을 팔로우할 수 없습니다',
      });
    }
    const existing = await this.followRepo.findOne(followerId, followingId);
    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_FOLLOWING',
        message: '이미 팔로우 중인 사용자입니다',
      });
    }
    const entity = this.followRepo.createEntity(followerId, followingId);
    const saved = await this.followRepo.save(entity);
    return this.toDto(saved);
  }

  async remove(followerId: string, followingId: string): Promise<void> {
    const affected = await this.followRepo.deleteByPair(followerId, followingId);
    if (affected === 0) {
      throw new NotFoundException({
        code: 'FOLLOW_NOT_FOUND',
        message: '팔로우 관계를 찾을 수 없습니다',
      });
    }
  }

  async listFollowers(userId: string): Promise<FollowResponseDto[]> {
    const rows = await this.followRepo.findFollowers(userId);
    return rows.map((r) => this.toDto(r));
  }

  async listFollowings(userId: string): Promise<FollowResponseDto[]> {
    const rows = await this.followRepo.findFollowings(userId);
    return rows.map((r) => this.toDto(r));
  }

  async check(followerId: string, followingId: string): Promise<FollowCheckResponseDto> {
    const isFollowing = await this.followRepo.exists(followerId, followingId);
    return { isFollowing };
  }

  private toDto(entity: Follow): FollowResponseDto {
    return {
      followerId: entity.followerId,
      followingId: entity.followingId,
      createdAt: entity.createdAt,
    };
  }
}
