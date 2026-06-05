import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { StreakRankingResponseDto } from './dto/streak-ranking.response.dto';

@ApiTags('ranking')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // public endpoint (인증 불필요) — 전역 JwtAuthGuard 미적용 상태이므로 가드 없음.
  @Get('streak')
  @ApiOperation({ summary: '스트릭 랭킹 TOP 5 + 그래프 메타 반환' })
  @ApiOkResponse({ type: StreakRankingResponseDto })
  getStreakRanking(): StreakRankingResponseDto {
    return this.rankingService.getStreakRanking();
  }
}
