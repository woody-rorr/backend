import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity, OrderStatus } from '../entities/order.entity';

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ description: 'KRW' })
  price: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string;

  static fromEntity(entity: OrderEntity): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.productName = entity.productName;
    dto.quantity = entity.quantity;
    dto.price = entity.price;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
