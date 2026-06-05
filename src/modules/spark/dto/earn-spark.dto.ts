import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, MaxLength } from 'class-validator';

export class EarnSparkDto {
  @ApiProperty({ format: 'uuid', description: '대상 사용자 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: '증감량 (+ 적립 / - 차감)', example: 100 })
  @IsInt()
  amount: number;

  @ApiProperty({ maxLength: 255, description: '적립/차감 사유' })
  @IsString()
  @MaxLength(255)
  reason: string;
}
