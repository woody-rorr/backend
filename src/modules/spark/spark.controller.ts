import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SparkService } from './spark.service';
import { AwardSparkDto, SparkHistoryQueryDto, SparkMeResponseDto, SparkResponseDto } from './dto/spark.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthenticatedRequest { user: { sub: string; roles: string[] }; }

@ApiTags('spark')
@ApiBearerAuth()
@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('me')
  @ApiOperation({ summary: '내 Spark 누적/레벨 조회' })
  @ApiResponse({ status: 200, type: SparkMeResponseDto })
  getMe(@Req() req: AuthenticatedRequest): Promise<SparkMeResponseDto> {
    return this.sparkService.getMe(req.user.sub);
  }

  @Get('history')
  @ApiOperation({ summary: '내 Spark 적립 이력' })
  @ApiResponse({ status: 200, type: SparkResponseDto, isArray: true })
  getHistory(@Req() req: AuthenticatedRequest, @Query() query: SparkHistoryQueryDto) {
    return this.sparkService.getHistory(req.user.sub, query);
  }

  @Post('award')
  @UseGuards(RolesGuard)
  @Roles('internal')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Spark 지급 (internal 전용)' })
  @ApiResponse({ status: 201, type: SparkMeResponseDto })
  award(@Body() dto: AwardSparkDto): Promise<SparkMeResponseDto> {
    return this.sparkService.award(dto);
  }
}
