import { ApiProperty } from '@nestjs/swagger';

export class SparkBalanceResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ type: 'integer', description: '누적 Spark 잔액' })
  balance: number;

  constructor(userId: string, balance: number) {
    this.userId = userId;
    this.balance = balance;
  }
}
