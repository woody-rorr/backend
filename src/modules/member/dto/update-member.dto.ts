import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: '표시 이름', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL', maxLength: 500 })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(500)
  profile_image_url?: string;
}
