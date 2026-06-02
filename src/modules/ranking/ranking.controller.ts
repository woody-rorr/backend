import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RankingService } from './ranking.service';
import { RankingQueryDto, RankingUpdateQueryDto } from './dto/ranking-query.dto';
import { RankingEntryResponseDto } from './dto/ranking-entry-response.dto';

interface AuthedRequest { user: { sub: string; email?: string; roles: string[] }; }

@ApiTags('ranking')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @ApiOperation({ summary: '월간 랭킹 목록 (상위 50명, W1 이상)' })
  @ApiResponse({ status: 200, type: [RankingEntryResponseDto] })
  async list(@Query() query: RankingQueryDto): Promise<RankingEntryResponseDto[]> {
    return this.rankingService.getRanking(query.period);
  }

  @Get('me')
  @ApiOperation({ summary: '내 현재 랭킹 + Streak 확인' })
  @ApiResponse({ status: 200, type: RankingEntryResponseDto })
  async me(@Query() query: RankingQueryDto, @Req() req: AuthedRequest): Promise<RankingEntryResponseDto> {
    return this.rankingService.getMyRanking(req.user.sub, query.period);
  }

  @Post('settle/:period')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '월간 정산 (admin)' })
  async settle(@Param('period') period: string): Promise<{ period: string; settled: number }> {
    return this.rankingService.settle(period);
  }

  @Post('update')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '랭킹 재계산 (admin/스케줄러)' })
  async update(@Query() query: RankingUpdateQueryDto): Promise<{ period: string; updated: number }> {
    return this.rankingService.recalculate(query.period);
  }
}
