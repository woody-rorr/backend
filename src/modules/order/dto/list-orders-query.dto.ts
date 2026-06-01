import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const SORTS = ['createdAt:asc', 'createdAt:desc', 'totalAmount:asc', 'totalAmount:desc'] as const;
const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: string;

  @ApiPropertyOptional({ enum: SORTS, default: 'createdAt:desc' })
  @IsOptional()
  @IsIn(SORTS as unknown as string[])
  sort = 'createdAt:desc';
}
