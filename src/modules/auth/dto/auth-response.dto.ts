import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
  @ApiProperty({ example: 'Jane Doe' })
  name!: string;
  @ApiProperty({ format: 'date-time', example: '2026-05-27T10:00:00Z' })
  createdAt!: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token (Bearer)' })
  accessToken!: string;
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
