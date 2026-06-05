import { ApiProperty } from '@nestjs/swagger';
import { Follow } from '../entities/follow.entity';

export class FollowResponseDto {
  @ApiProperty({ format: 'uuid', description: '팔로우 레코드 ID' })
  id: string;

  @ApiProperty({ format: 'uuid', description: '팔로우를 한 사용자 ID' })
  followerId: string;

  @ApiProperty({ format: 'uuid', description: '팔로우 대상 사용자 ID' })
  followingId: string;

  @ApiProperty({ description: '생성 시각 (ISO 8601)' })
  createdAt: string;

  static fromEntity(entity: Follow): FollowResponseDto {
    const dto = new FollowResponseDto();
    dto.id = entity.id;
    dto.followerId = entity.followerId;
    dto.followingId = entity.followingId;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
