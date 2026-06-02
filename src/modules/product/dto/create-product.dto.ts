import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: '상품명', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '상품 상세 설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '가격 (소수점 2자리)', example: 19900.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: '재고 수량', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: '카테고리', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: '상품 이미지 URL', maxLength: 1000 })
  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  imageUrl?: string;

  @ApiPropertyOptional({ description: '판매 활성화 여부', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// 10-file cap for this scope forces Update DTO to live beside Create.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
