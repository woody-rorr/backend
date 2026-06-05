import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty({ format: 'uuid' })
  followerId: string;

  @ApiProperty({ format: 'uuid' })
  followingId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}
