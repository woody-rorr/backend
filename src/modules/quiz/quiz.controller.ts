import { Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { QuizService } from './quiz.service';
import { ParticipateDto, PaginationQueryDto, RankingQueryDto } from './dto/quiz.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('participate')
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: '승패 예측 제출' })
  @ApiResponse({ status: 201, description: '참여 성공' })
  @ApiResponse({ status: 409, description: '이미 참여한 퀴즈' })
  participate(@Req() req: AuthenticatedRequest, @Body() dto: ParticipateDto) {
    return this.quizService.participate(req.user.sub, dto);
  }

  @Public()
  @Get('available')
  @ApiOperation({ summary: '참여 가능한 경기 목록' })
  @ApiResponse({ status: 200, description: '목록 조회 성공' })
  available() {
    return this.quizService.getAvailableQuizzes();
  }

  @Get('my-participations')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 참여 내역' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  myParticipations(@Req() req: AuthenticatedRequest, @Query() query: PaginationQueryDto) {
    return this.quizService.getMyParticipations(req.user.sub, query.page, query.limit);
  }

  @Public()
  @Get('ranking')
  @ApiOperation({ summary: 'Ranking 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  ranking(@Query() query: RankingQueryDto) {
    return this.quizService.getRanking(query.period);
  }

  @Get('my-streak')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 Streak 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  myStreak(@Req() req: AuthenticatedRequest) {
    return this.quizService.getMyStreak(req.user.sub);
  }
}
