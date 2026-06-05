import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum ConsumeType {
  BOOST_CONSUME = 'BOOST_CONSUME',
  ITEM_PURCHASE = 'ITEM_PURCHASE',
}

export class PurchaseEnergyDto {
  @ApiProperty({ example: 100, description: '구매 Energy 수량 (> 0)' })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: '결제 ID (중복 불가)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  paymentId: string;
}

export class ConsumeEnergyDto {
  @ApiProperty({ description: '차감 대상 사용자 ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 10, description: '차감 Energy 수량 (> 0)' })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: ConsumeType, description: '차감 유형' })
  @IsEnum(ConsumeType)
  type: ConsumeType;

  @ApiProperty({ description: '차감 사유' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;

  @ApiPropertyOptional({ description: '연관 리소스 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceId?: string;

  @ApiPropertyOptional({ description: '연관 리소스 타입' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceType?: string;
}

export class QueryTransactionsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
