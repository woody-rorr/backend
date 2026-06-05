import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SparkService } from './spark.service';
import { EarnSparkDto } from './dto/earn-spark.dto';
import { SparkHistoryQueryDto } from './dto/spark-history-query.dto';
import { SparkTransactionResponseDto } from './dto/spark-transaction-response.dto';

type AuthedRequest = { user: { sub: string } };

@ApiTags('spark')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('balance')
  @ApiOperation({ summary: '현재 Spark 잔액 조회' })
  @ApiResponse({ status: 200, description: '현재 잔액' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  async getBalance(
    @Req() req: AuthedRequest,
  ): Promise<{ userId: string; balance: number }> {
    return this.sparkService.getBalance(req.user.sub);
  }

  @Post('earn')
  @HttpCode(201)
  @ApiOperation({ summary: 'Spark 포인트 적립/차감' })
  @ApiResponse({ status: 201, type: SparkTransactionResponseDto })
  @ApiResponse({ status: 400, description: 'validation 실패' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  async earn(
    @Body() dto: EarnSparkDto,
  ): Promise<SparkTransactionResponseDto> {
    return this.sparkService.earn(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Spark 거래 내역 조회 (페이지네이션)' })
  @ApiResponse({ status: 200, description: '거래 내역 목록' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  async getHistory(
    @Req() req: AuthedRequest,
    @Query() query: SparkHistoryQueryDto,
  ) {
    return this.sparkService.getHistory(req.user.sub, query);
  }
}
