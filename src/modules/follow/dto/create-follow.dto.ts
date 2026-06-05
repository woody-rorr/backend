import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFollowDto {
  @ApiProperty({ format: 'uuid', description: '팔로우 대상 사용자 ID' })
  @IsUUID()
  @IsNotEmpty()
  followingId: string;
}
