import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SparkService } from './spark.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GrantSparkDto } from './dto/grant-spark.dto';
import { SparkBalanceResponseDto } from './dto/spark-balance-response.dto';
import { SparkTransactionResponseDto } from './dto/spark-transaction-response.dto';

interface JwtUser {
  sub: string;
  email?: string;
  roles: string[];
}

@ApiTags('spark')
@ApiBearerAuth()
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('balance')
  @ApiOperation({ summary: '본인 누적 Spark 잔액 조회' })
  @ApiResponse({ status: 200, type: SparkBalanceResponseDto })
  async getBalance(@Req() req: Request): Promise<SparkBalanceResponseDto> {
    const user = req.user as unknown as JwtUser;
    const balance = await this.sparkService.getBalance(user.sub);
    return new SparkBalanceResponseDto(user.sub, balance);
  }

  @Post('grant')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(201)
  @ApiOperation({ summary: 'Spark 수동 지급 (admin only)' })
  @ApiResponse({ status: 201, type: SparkTransactionResponseDto })
  async grant(@Body() dto: GrantSparkDto): Promise<SparkTransactionResponseDto> {
    const tx = await this.sparkService.grant(dto.userId, dto.amount, dto.reason);
    return new SparkTransactionResponseDto(tx);
  }
}
