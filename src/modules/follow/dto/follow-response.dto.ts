import { ApiProperty } from '@nestjs/swagger';
import { FollowEntity, FollowTargetType } from '../entities/follow.entity';

export class FollowResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ enum: FollowTargetType })
  targetType: FollowTargetType;

  @ApiProperty()
  targetId: string;

  @ApiProperty()
  targetName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  static from(entity: FollowEntity): FollowResponseDto {
    const dto = new FollowResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.targetType = entity.targetType;
    dto.targetId = entity.targetId;
    dto.targetName = entity.targetName;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
