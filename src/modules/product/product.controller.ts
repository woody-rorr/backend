import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ListProductQueryDto } from './dto/list-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '상품 생성' })
  @ApiResponse({ status: 201, description: '생성된 상품' })
  @ApiResponse({ status: 400, description: 'validation 실패' })
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '상품 목록 조회 (페이징, category/isActive 필터)' })
  @ApiResponse({ status: 200, description: '상품 목록 + 페이지 메타' })
  findAll(@Query() query: ListProductQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiResponse({ status: 200, description: '상품 상세' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '상품 수정' })
  @ApiResponse({ status: 200, description: '수정된 상품' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '상품 삭제' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: '재고 수량 조정' })
  @ApiResponse({ status: 200, description: '조정된 상품' })
  @ApiResponse({ status: 404, description: '상품 없음' })
  @ApiResponse({ status: 422, description: '재고 부족 (INSUFFICIENT_STOCK)' })
  adjustStock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.service.adjustStock(id, dto);
  }
}
