import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID, MaxLength } from 'class-validator';

export class GrantSparkDto {
  @ApiProperty({ format: 'uuid', description: '지급 대상 유저 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ type: 'integer', minimum: 1, description: '지급 Spark 수량' })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ maxLength: 255, description: '지급 사유' })
  @IsString()
  @MaxLength(255)
  reason: string;
}
