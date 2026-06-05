import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class SpendSparkDto {
  @ApiProperty({ description: '차감할 Spark 수량', example: 50 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: '차감 사유', example: 'reward-redemption' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}