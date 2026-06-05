import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { SparkTransactionType } from '../entities/spark-transaction.entity';

export class GrantSparkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ minimum: 1, description: '지급할 Spark 양 (양수)' })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: SparkTransactionType })
  @IsEnum(SparkTransactionType)
  type: SparkTransactionType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  referenceType?: string;
}

export class SparkTransactionQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;
}

export class SparkResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  totalSpark: number;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;
}

export class SparkTransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: SparkTransactionType })
  type: SparkTransactionType;

  @ApiProperty()
  reason: string;

  @ApiPropertyOptional({ nullable: true })
  referenceId: string | null;

  @ApiPropertyOptional({ nullable: true })
  referenceType: string | null;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;
}

export class SparkTransactionListResponseDto {
  @ApiProperty({ type: [SparkTransactionResponseDto] })
  items: SparkTransactionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class GrantSparkResponseDto {
  @ApiProperty({ type: SparkTransactionResponseDto })
  transaction: SparkTransactionResponseDto;

  @ApiProperty()
  newBalance: number;
}

export class DailyLoginResponseDto {
  @ApiProperty()
  granted: boolean;

  @ApiPropertyOptional({ type: SparkTransactionResponseDto, nullable: true })
  transaction: SparkTransactionResponseDto | null;

  @ApiProperty()
  message: string;
}
