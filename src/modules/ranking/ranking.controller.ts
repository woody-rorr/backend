import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { QueryRankingDto } from './dto/query-ranking.dto';
import { MyRankingResponseDto, RankingListResponseDto } from './dto/ranking-response.dto';
import { RankingService } from './ranking.service';

@ApiTags('rankings')
@Controller('rankings')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '기간별 랭킹 조회 (longestStreak >= 1 만 반환)' })
  @ApiResponse({ status: 200, type: RankingListResponseDto })
  list(@Query() query: QueryRankingDto): Promise<RankingListResponseDto> {
    return this.rankingService.listRankings(query.period);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 랭킹 조회 (인증 필수, 미기록 시 null)' })
  @ApiResponse({ status: 200, type: MyRankingResponseDto })
  getMine(
    @Req() req: any,
    @Query() query: QueryRankingDto,
  ): Promise<MyRankingResponseDto | null> {
    return this.rankingService.getMyRanking(req.user.sub, query.period);
  }
}
