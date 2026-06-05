import { ApiProperty } from '@nestjs/swagger';

export class RankingMeResponseDto {
  @ApiProperty({ example: 7 })
  rank: number;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 1280 })
  score: number;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl: string | null;

  @ApiProperty({ example: 'woody' })
  username: string;
}
