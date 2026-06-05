import { ApiProperty } from '@nestjs/swagger';

export class FollowStatusResponseDto {
  @ApiProperty({ format: 'uuid', description: '관계를 확인한 대상 사용자 ID' })
  userId: string;

  @ApiProperty({ description: '현재 사용자가 대상을 팔로우 중인지' })
  isFollowing: boolean;

  @ApiProperty({ description: '대상이 현재 사용자를 팔로우 중인지' })
  isFollowedBy: boolean;
}
