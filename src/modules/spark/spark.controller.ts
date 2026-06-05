import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SparkActor, SparkService } from './spark.service';
import {
  DailyLoginResponseDto,
  GrantSparkDto,
  GrantSparkResponseDto,
  SparkResponseDto,
  SparkTransactionListResponseDto,
  SparkTransactionQueryDto,
} from './dto/spark.dto';

@ApiTags('spark')
@ApiBearerAuth()
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get()
  @ApiOperation({ summary: '현재 사용자의 Spark 잔액 조회' })
  @ApiResponse({ status: 200, type: SparkResponseDto })
  getBalance(@Req() req: Request & { user: SparkActor }): Promise<SparkResponseDto> {
    return this.sparkService.getBalance(req.user.sub);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Spark 획득/차감 내역 조회 (최신순)' })
  @ApiResponse({ status: 200, type: SparkTransactionListResponseDto })
  getTransactions(
    @Req() req: Request & { user: SparkActor },
    @Query() query: SparkTransactionQueryDto,
  ): Promise<SparkTransactionListResponseDto> {
    return this.sparkService.getTransactions(req.user.sub, query);
  }

  @Post('grant')
  @ApiOperation({ summary: 'Spark 지급 (내부/admin, 중복 체크 포함)' })
  @ApiResponse({ status: 201, type: GrantSparkResponseDto })
  grant(
    @Req() req: Request & { user: SparkActor },
    @Body() dto: GrantSparkDto,
  ): Promise<GrantSparkResponseDto> {
    return this.sparkService.grant(req.user, dto);
  }

  @Post('daily-login')
  @ApiOperation({ summary: '로그인 보상 Spark 지급 (날짜별 1회 제한)' })
  @ApiResponse({ status: 201, type: DailyLoginResponseDto })
  dailyLogin(@Req() req: Request & { user: SparkActor }): Promise<DailyLoginResponseDto> {
    return this.sparkService.dailyLogin(req.user.sub);
  }
}
