import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { SparkReason } from '../entities/spark.entity';

export class AwardSparkDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: SparkReason })
  @IsEnum(SparkReason)
  reason: SparkReason;

  @ApiPropertyOptional({ minimum: 20, maximum: 3000 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(3000)
  amount?: number;
}

export class SparkHistoryQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class SparkResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() amount: number;
  @ApiProperty({ enum: SparkReason }) reason: SparkReason;
  @ApiProperty() createdAt: string;
}

export class SparkMeResponseDto {
  @ApiProperty() userId: string;
  @ApiProperty() totalSpark: number;
  @ApiProperty() level: number;
  @ApiProperty() levelName: string;
  @ApiProperty({ nullable: true }) nextLevelAt: number | null;
}
