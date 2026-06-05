import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class EarnSparkDto {
  @ApiProperty({ description: '적립할 Spark 수량', example: 100 })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: '적립 사유', example: 'daily-login-bonus' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}