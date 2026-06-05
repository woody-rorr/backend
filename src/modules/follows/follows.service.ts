import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatusResponseDto } from './dto/follow-status-response.dto';
import { FollowsRepository } from './follows.repository';

@Injectable()
export class FollowsService {
  constructor(private readonly followsRepository: FollowsRepository) {}

  async follow(followerId: string, followingId: string): Promise<FollowResponseDto> {
    if (followerId === followingId) {
      throw new UnprocessableEntityException({
        code: 'CANNOT_FOLLOW_SELF',
        message: '자기 자신은 팔로우할 수 없습니다',
      });
    }
    const existing = await this.followsRepository.find(followerId, followingId);
    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_FOLLOWING',
        message: '이미 팔로우하고 있습니다',
      });
    }
    const follow = await this.followsRepository.createFollow(followerId, followingId);
    return FollowResponseDto.fromEntity(follow);
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const existing = await this.followsRepository.find(followerId, followingId);
    if (!existing) {
      throw new NotFoundException({
        code: 'FOLLOW_NOT_FOUND',
        message: '팔로우 관계를 찾을 수 없습니다',
      });
    }
    await this.followsRepository.remove(existing.id);
  }

  async getFollowers(userId: string): Promise<FollowResponseDto[]> {
    const rows = await this.followsRepository.findByFollowing(userId);
    return rows.map((row) => FollowResponseDto.fromEntity(row));
  }

  async getFollowing(userId: string): Promise<FollowResponseDto[]> {
    const rows = await this.followsRepository.findByFollower(userId);
    return rows.map((row) => FollowResponseDto.fromEntity(row));
  }

  async getStatus(currentUserId: string, targetUserId: string): Promise<FollowStatusResponseDto> {
    const [following, followedBy] = await Promise.all([
      this.followsRepository.find(currentUserId, targetUserId),
      this.followsRepository.find(targetUserId, currentUserId),
    ]);
    const dto = new FollowStatusResponseDto();
    dto.userId = targetUserId;
    dto.isFollowing = !!following;
    dto.isFollowedBy = !!followedBy;
    return dto;
  }
}
