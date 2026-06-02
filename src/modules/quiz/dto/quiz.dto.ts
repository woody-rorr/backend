import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SubmitQuizDto {
  @ApiProperty({ description: '경기 식별자', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  matchId: string;

  @ApiProperty({ description: '예측한 승자', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  predictedWinner: string;
}

export class SettleQuizDto {
  @ApiProperty({ description: '정산할 경기 식별자', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  matchId: string;

  @ApiProperty({ description: '실제 승자', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  actualWinner: string;
}

export class QuizHistoryQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class QuizEntryResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) userId: string;
  @ApiProperty() matchId: string;
  @ApiProperty() predictedWinner: string;
  @ApiProperty({ nullable: true }) actualWinner: string | null;
  @ApiProperty({ nullable: true }) isCorrect: boolean | null;
  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
}

export class QuizStreakResponseDto {
  @ApiProperty({ format: 'uuid' }) userId: string;
  @ApiProperty() currentStreak: number;
  @ApiProperty() longestStreak: number;
  @ApiProperty({ nullable: true }) lastMatchId: string | null;
  @ApiProperty({ description: 'ISO 8601', nullable: true }) updatedAt: string | null;
}
