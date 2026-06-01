import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  productName: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ minimum: 0, description: 'KRW' })
  @IsInt()
  @Min(0)
  price: number;
}
