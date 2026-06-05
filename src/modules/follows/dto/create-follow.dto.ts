import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFollowDto {
  @ApiProperty({ description: '팔로우할 사용자 ID', format: 'uuid' })
  @IsUUID()
  followingId: string;
}
