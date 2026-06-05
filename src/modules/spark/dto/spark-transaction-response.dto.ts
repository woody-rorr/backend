import { ApiProperty } from '@nestjs/swagger';
import { SparkTransaction } from '../entities/spark-transaction.entity';

export class SparkTransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  reason: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  static fromEntity(entity: SparkTransaction): SparkTransactionResponseDto {
    const dto = new SparkTransactionResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.amount = entity.amount;
    dto.balance = entity.balance;
    dto.reason = entity.reason;
    dto.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : (entity.createdAt as unknown as string);
    return dto;
  }
}
