import { ApiProperty } from '@nestjs/swagger';
import { SparkEntity } from '../entities/spark.entity';

export class SparkResponseDto {
  @ApiProperty({ nullable: true, description: '잔고 row id (미생성 시 null)' })
  id: string | null;

  @ApiProperty({ description: '소유자 user id' })
  userId: string;

  @ApiProperty({ example: 100, description: '현재 Spark 잔고' })
  amount: number;

  @ApiProperty({ nullable: true, description: '마지막 갱신 시각 (ISO 8601)' })
  updatedAt: string | null;

  static from(entity: SparkEntity): SparkResponseDto {
    const dto = new SparkResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.amount = entity.amount;
    dto.updatedAt = entity.updatedAt ? entity.updatedAt.toISOString() : null;
    return dto;
  }

  static zero(userId: string): SparkResponseDto {
    const dto = new SparkResponseDto();
    dto.id = null;
    dto.userId = userId;
    dto.amount = 0;
    dto.updatedAt = null;
    return dto;
  }
}