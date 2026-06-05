import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SparkService } from './spark.service';
import { EarnSparkDto } from './dto/earn-spark.dto';
import { SpendSparkDto } from './dto/spend-spark.dto';
import { SparkResponseDto } from './dto/spark-response.dto';

type AuthenticatedRequest = Request & { user: { sub: string } };

@ApiTags('spark')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get()
  @ApiOperation({ summary: '내 Spark 잔고 조회' })
  @ApiResponse({ status: 200, type: SparkResponseDto })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  getBalance(@Req() req: AuthenticatedRequest): Promise<SparkResponseDto> {
    return this.sparkService.getBalance(req.user.sub);
  }

  @Post('earn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Spark 적립' })
  @ApiResponse({ status: 200, type: SparkResponseDto })
  @ApiResponse({ status: 400, description: 'VALIDATION_ERROR' })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  earn(
    @Req() req: AuthenticatedRequest,
    @Body() dto: EarnSparkDto,
  ): Promise<SparkResponseDto> {
    return this.sparkService.earnSpark(req.user.sub, dto);
  }

  @Post('spend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Spark 차감' })
  @ApiResponse({ status: 200, type: SparkResponseDto })
  @ApiResponse({ status: 400, description: 'VALIDATION_ERROR' })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 422, description: 'INSUFFICIENT_SPARK' })
  spend(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SpendSparkDto,
  ): Promise<SparkResponseDto> {
    return this.sparkService.spendSpark(req.user.sub, dto);
  }
}