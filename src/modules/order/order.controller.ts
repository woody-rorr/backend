import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

interface JwtPayload {
  sub: string;
  email?: string;
  roles: string[];
}

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  private userId(req: Request): string {
    return (req.user as JwtPayload).sub;
  }

  @Post()
  @ApiOperation({ summary: '주문 생성' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'validation 실패' })
  @ApiResponse({ status: 422, description: '하루 주문 한도 초과' })
  create(@Req() req: Request, @Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.orderService.create(this.userId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: '내 주문 목록 조회 (페이지네이션)' })
  findAll(@Req() req: Request, @Query() query: ListOrdersQueryDto) {
    return this.orderService.findAll(this.userId(req), query);
  }

  @Get(':id')
  @ApiOperation({ summary: '주문 단건 조회' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 404, description: '주문 없음' })
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.orderService.findOne(this.userId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '주문 정보 수정 (pending 한정)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 422, description: 'pending 상태가 아님' })
  update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.update(this.userId(req), id, dto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '주문 결제 (pending -> paid)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 422, description: 'pending 상태가 아님' })
  pay(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.orderService.pay(this.userId(req), id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '주문 취소 (pending|paid -> cancelled)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiResponse({ status: 409, description: '이미 취소됨' })
  @ApiResponse({ status: 422, description: '취소 불가 상태' })
  cancel(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDto> {
    return this.orderService.cancel(this.userId(req), id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '주문 삭제 (취소된 주문 한정, soft delete)' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 422, description: '취소된 주문이 아님' })
  remove(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.orderService.remove(this.userId(req), id);
  }
}
