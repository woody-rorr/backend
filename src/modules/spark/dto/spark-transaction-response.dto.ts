import { ApiProperty } from '@nestjs/swagger';
import { SparkTransaction } from '../entities/spark-transaction.entity';

export class SparkTransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ type: 'integer' })
  amount: number;

  @ApiProperty()
  reason: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: string;

  constructor(tx: SparkTransaction) {
    this.id = tx.id;
    this.userId = tx.userId;
    this.amount = tx.amount;
    this.reason = tx.reason;
    this.createdAt = tx.createdAt.toISOString();
  }
}
