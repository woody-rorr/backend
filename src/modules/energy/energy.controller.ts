import { Body, Controller, ForbiddenException, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnergyService } from './energy.service';
import { ConsumeEnergyDto, PurchaseEnergyDto, QueryTransactionsDto } from './dto/energy.dto';

type AuthedReq = { user: { sub: string; roles?: string[] } };

@ApiTags('energy')
@ApiBearerAuth()
@Controller('energy')
export class EnergyController {
  constructor(private readonly service: EnergyService) {}

  @Get()
  @ApiOperation({ summary: '현재 사용자의 Energy 잔액 조회' })
  @ApiResponse({ status: 200, description: 'Energy 잔액' })
  getBalance(@Req() req: AuthedReq) {
    return this.service.getBalance(req.user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Energy 구매/차감 내역 조회 (최신순)' })
  @ApiResponse({ status: 200, description: '내역 페이지' })
  getTransactions(@Req() req: AuthedReq, @Query() query: QueryTransactionsDto) {
    return this.service.getTransactions(req.user.sub, query);
  }

  @Post('purchase')
  @ApiOperation({ summary: 'Energy 구매 (결제 완료 후)' })
  @ApiResponse({ status: 201, description: '구매 트랜잭션 및 신규 잔액' })
  purchase(@Req() req: AuthedReq, @Body() dto: PurchaseEnergyDto) {
    return this.service.purchase(req.user.sub, dto);
  }

  @Post('consume')
  @ApiOperation({ summary: 'Energy 차감 (Boost/아이템 구매 시, internal or admin)' })
  @ApiResponse({ status: 201, description: '차감 트랜잭션 및 신규 잔액' })
  consume(@Req() req: AuthedReq, @Body() dto: ConsumeEnergyDto) {
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '권한이 없습니다' });
    }
    return this.service.consume(dto);
  }
}
