import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  SPARK_TRANSACTION_TYPES,
  SparkTransactionType,
} from '../entities/spark-transaction.entity';

export class GetTransactionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class SparkBalanceResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 0 })
  balance: number;
}

export class SparkTransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ description: '증가는 양수, 차감은 음수로 기록' })
  amount: number;

  @ApiProperty({ enum: SPARK_TRANSACTION_TYPES })
  type: SparkTransactionType;

  @ApiProperty({ nullable: true })
  referenceId: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
}
