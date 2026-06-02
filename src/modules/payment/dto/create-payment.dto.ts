import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { PAYMENT_METHODS, PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 10000, description: '결제 금액' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'KRW', description: '통화 (ISO 4217)', default: 'KRW' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({ enum: PAYMENT_METHODS, description: '결제 수단' })
  @IsIn(PAYMENT_METHODS)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: '추가 정보 (JSON)', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pg_tx_1234567890', description: 'PG사 거래 ID' })
  @IsString()
  @MaxLength(255)
  transactionId: string;
}
