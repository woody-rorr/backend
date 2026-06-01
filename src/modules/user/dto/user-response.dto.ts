import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, nullable: true })
  profileImage: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  static fromEntity(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.profileImage = entity.profileImage ?? null;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
