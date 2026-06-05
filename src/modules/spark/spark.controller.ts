import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  GetTransactionsQueryDto,
  SparkBalanceResponseDto,
  SparkTransactionResponseDto,
} from './dto/spark.dto';
import { SparkService } from './spark.service';

interface JwtPayload {
  sub: string;
  email?: string;
  roles: string[];
}

@ApiTags('sparks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sparks')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('me')
  @ApiOperation({ summary: '내 Spark 잔액 조회' })
  @ApiOkResponse({ type: SparkBalanceResponseDto })
  async getMyBalance(@Req() req: Request): Promise<SparkBalanceResponseDto> {
    const user = req.user as JwtPayload;
    const balance = await this.sparkService.getBalance(user.sub);
    return { userId: user.sub, balance };
  }

  @Get('transactions')
  @ApiOperation({ summary: '내 Spark 거래 내역 조회' })
  @ApiOkResponse({ type: SparkTransactionResponseDto, isArray: true })
  async getMyTransactions(
    @Req() req: Request,
    @Query() query: GetTransactionsQueryDto,
  ): Promise<{
    data: SparkTransactionResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const user = req.user as JwtPayload;
    const { page, limit } = query;
    const offset = (page - 1) * limit;
    const { items, total } = await this.sparkService.getTransactions(
      user.sub,
      limit,
      offset,
    );
    return {
      data: items.map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        amount: tx.amount,
        type: tx.type,
        referenceId: tx.referenceId,
        createdAt: tx.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }
}
