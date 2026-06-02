import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    description: '재고 증감량 (양수=입고, 음수=출고). 결과 재고가 음수가 되면 422.',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  quantity: number;
}
