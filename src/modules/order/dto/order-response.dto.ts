import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity, OrderItem, OrderStatus } from '../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() orderNumber: string;
  @ApiProperty() userId: string;
  @ApiProperty({ enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  status: OrderStatus;
  @ApiProperty({ type: 'array', items: { type: 'object' } }) items: OrderItem[];
  @ApiProperty({ example: 99.98 }) totalAmount: number;
  @ApiProperty({ example: 'USD' }) currency: string;
  @ApiProperty() shippingAddress: string;
  @ApiProperty({ nullable: true }) notes: string | null;
  @ApiProperty({ nullable: true, type: String }) paidAt: string | null;
  @ApiProperty({ nullable: true, type: String }) cancelledAt: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;

  static from(e: OrderEntity): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = e.id;
    dto.orderNumber = e.orderNumber;
    dto.userId = e.userId;
    dto.status = e.status;
    dto.items = e.items ?? [];
    dto.totalAmount = e.totalAmount;
    dto.currency = e.currency;
    dto.shippingAddress = e.shippingAddress;
    dto.notes = e.notes;
    dto.paidAt = e.paidAt ? e.paidAt.toISOString() : null;
    dto.cancelledAt = e.cancelledAt ? e.cancelledAt.toISOString() : null;
    dto.createdAt = e.createdAt.toISOString();
    dto.updatedAt = e.updatedAt.toISOString();
    return dto;
  }
}
