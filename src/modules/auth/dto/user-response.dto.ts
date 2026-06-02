import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty({ nullable: true, required: false })
  profileImageUrl: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;

  static from(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.displayName = user.displayName;
    dto.profileImageUrl = user.profileImageUrl;
    dto.createdAt = user.createdAt.toISOString();
    dto.updatedAt = user.updatedAt.toISOString();
    return dto;
  }
}

export class AuthTokenResponseDto {
  @ApiProperty({ description: 'JWT access token (Authorization: Bearer)' })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  static from(accessToken: string, user: User): AuthTokenResponseDto {
    const dto = new AuthTokenResponseDto();
    dto.accessToken = accessToken;
    dto.user = UserResponseDto.from(user);
    return dto;
  }
}
