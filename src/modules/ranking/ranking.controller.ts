import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MyRankingQueryDto, RankingQueryDto, RankingResponseDto } from './dto/ranking.dto';
import { RankingService } from './ranking.service';

interface AuthedRequest extends Request {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('rankings')
@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '상위 랭킹 목록 조회 (W1 이상, Longest Streak 기준)' })
  @ApiOkResponse({ type: RankingResponseDto, isArray: true })
  getRankings(@Query() query: RankingQueryDto) {
    return this.rankingService.getRankings(query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '내 랭킹 및 Streak 정보 조회' })
  @ApiOkResponse({ type: RankingResponseDto })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED' })
  getMyRanking(@Req() req: AuthedRequest, @Query() query: MyRankingQueryDto) {
    return this.rankingService.getMyRanking(req.user.sub, query);
  }
}
