import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { FollowTargetType } from '../entities/follow.entity';

export class CreateFollowDto {
  @ApiProperty({ enum: FollowTargetType })
  @IsEnum(FollowTargetType)
  targetType: FollowTargetType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  targetId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  targetName: string;
}
