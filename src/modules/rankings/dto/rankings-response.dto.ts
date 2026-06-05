import { ApiProperty } from '@nestjs/swagger';

export class RankingEntryDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 4200 })
  score: number;

  @ApiProperty({ type: String, nullable: true, example: null })
  avatarUrl: string | null;

  @ApiProperty({ example: 'woody' })
  username: string;
}

export class RankingSummaryBarDto {
  @ApiProperty({ example: 1 })
  rank: number;

  @ApiProperty({ example: 4200 })
  value: number;

  @ApiProperty({ example: 'woody' })
  label: string;
}

export class RankingSummaryDto {
  @ApiProperty({ type: [RankingSummaryBarDto] })
  bars: RankingSummaryBarDto[];

  @ApiProperty({ example: 5 })
  topN: number;

  @ApiProperty({ example: 4200 })
  maxValue: number;

  @ApiProperty({ example: 640 })
  graphWidth: number;

  @ApiProperty({ example: false })
  isNoData: boolean;
}

export class RankingsPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 123 })
  total: number;
}

export class RankingsResponseDto {
  @ApiProperty({ type: [RankingEntryDto] })
  items: RankingEntryDto[];

  @ApiProperty({ type: RankingEntryDto, nullable: true })
  me: RankingEntryDto | null;

  @ApiProperty({ type: RankingSummaryDto })
  summary: RankingSummaryDto;

  @ApiProperty({ type: RankingsPaginationDto })
  pagination: RankingsPaginationDto;
}
