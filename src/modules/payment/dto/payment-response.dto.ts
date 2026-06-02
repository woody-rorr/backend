import { ApiProperty } from '@nestjs/swagger';
import { PaymentEntity, PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ example: 10000 })
  amount: number;

  @ApiProperty({ example: 'KRW' })
  currency: string;

  @ApiProperty()
  method: PaymentMethod;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty({ nullable: true })
  transactionId: string | null;

  @ApiProperty({ nullable: true, type: Object })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;

  static fromEntity(e: PaymentEntity): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = e.id;
    dto.userId = e.userId;
    dto.amount = Number(e.amount);
    dto.currency = e.currency;
    dto.method = e.method;
    dto.status = e.status;
    dto.transactionId = e.transactionId;
    dto.metadata = e.metadata;
    dto.createdAt = e.createdAt.toISOString();
    dto.updatedAt = e.updatedAt.toISOString();
    return dto;
  }
}
