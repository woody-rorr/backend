import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SparkService } from './spark.service';
import { GrantSparkDto, SparkHistoryQueryDto } from './dto/spark.dto';

type AuthedRequest = Request & { user: { sub: string; roles?: string[] } };

@ApiTags('spark')
@ApiBearerAuth()
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('balance')
  @ApiOperation({ summary: '내 Spark 잔액 + 레벨 조회' })
  @ApiResponse({ status: 200, description: '잔액/레벨' })
  getBalance(@Req() req: AuthedRequest) {
    return this.sparkService.getBalance(req.user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: 'Spark 지급/차감 이력 (페이지네이션)' })
  @ApiResponse({ status: 200, description: '이력 목록' })
  getHistory(@Req() req: AuthedRequest, @Query() query: SparkHistoryQueryDto) {
    return this.sparkService.getHistory(req.user.sub, query);
  }

  @Post('grant')
  @HttpCode(201)
  @ApiOperation({ summary: '내부 서비스 간 Spark 지급/차감 (admin/service 권한)' })
  @ApiResponse({ status: 201, description: '지급 결과' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  grant(@Req() req: AuthedRequest, @Body() dto: GrantSparkDto) {
    return this.sparkService.grant(req.user, dto);
  }

  @Post('login-daily')
  @HttpCode(201)
  @ApiOperation({ summary: '일일 로그인 보상 (UTC 날짜별 1회)' })
  @ApiResponse({ status: 201, description: '지급 결과' })
  @ApiResponse({ status: 409, description: '오늘 이미 수령' })
  loginDaily(@Req() req: AuthedRequest) {
    return this.sparkService.loginDaily(req.user.sub);
  }
}
