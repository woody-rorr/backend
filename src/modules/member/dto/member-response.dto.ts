import { ApiProperty } from '@nestjs/swagger';
import { Member } from '../entities/member.entity';

export class MemberResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  profile_image_url: string | null;

  @ApiProperty({ description: 'ISO 8601', example: '2026-06-05T10:00:00Z' })
  created_at: string;

  static fromEntity(member: Member): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.id = member.id;
    dto.email = member.email;
    dto.name = member.name;
    dto.profile_image_url = member.profileImageUrl;
    dto.created_at = member.createdAt.toISOString();
    return dto;
  }
}
