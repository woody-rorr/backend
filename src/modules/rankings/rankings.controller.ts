import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RankingsService } from './rankings.service';
import { RankingsQueryDto } from './dto/rankings-query.dto';
import { RankingsResponseDto } from './dto/rankings-response.dto';
import { RankingMeResponseDto } from './dto/ranking-me-response.dto';

interface JwtUser {
  sub: string;
  email?: string;
  roles: string[];
}

@ApiTags('rankings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  @ApiOperation({ summary: '랭킹 목록 조회 (period/metric 별 최신 스냅샷)' })
  @ApiOkResponse({ type: RankingsResponseDto })
  getRankings(
    @Query() query: RankingsQueryDto,
    @Req() req: Request,
  ): Promise<RankingsResponseDto> {
    const user = req.user as unknown as JwtUser;
    return this.rankingsService.getRankings(query, user.sub);
  }

  @Get('me')
  @ApiOperation({ summary: '내 랭킹 조회 (없으면 null)' })
  @ApiOkResponse({ type: RankingMeResponseDto, isArray: false })
  getMyRanking(
    @Query() query: RankingsQueryDto,
    @Req() req: Request,
  ): Promise<RankingMeResponseDto | null> {
    const user = req.user as unknown as JwtUser;
    return this.rankingsService.getMyRanking(query, user.sub);
  }
}
