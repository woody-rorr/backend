import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { ConfirmPaymentDto, CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

interface AuthedRequest {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '결제 생성' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  create(
    @Req() req: AuthedRequest,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.create(req.user.sub, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 조회' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  findOne(
    @Req() req: AuthedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.findOne(req.user.sub, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 목록 (사용자별)' })
  list(@Req() req: AuthedRequest, @Query() query: QueryPaymentDto) {
    return this.paymentService.list(req.user.sub, query);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '결제 취소' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  cancel(
    @Req() req: AuthedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.cancel(req.user.sub, id);
  }

  @Post(':id/confirm')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '결제 승인 (PG 콜백)' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  confirm(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ConfirmPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.confirm(id, dto);
  }
}
