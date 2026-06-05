import { ApiProperty } from '@nestjs/swagger';

export class FollowCheckResponseDto {
  @ApiProperty({ description: '팔로우 여부' })
  isFollowing: boolean;
}
