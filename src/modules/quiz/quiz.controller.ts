import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { QuizService } from './quiz.service';
import { QuizHistoryQueryDto, SettleQuizDto, SubmitQuizDto } from './dto/quiz.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('submit')
  @ApiOperation({ summary: '승패 예측 제출' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: '이미 제출한 경기' })
  submit(@Req() req: AuthenticatedRequest, @Body() dto: SubmitQuizDto) {
    return this.quizService.submit(req.user.sub, dto);
  }

  @Post('settle/:matchId')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '경기 정산 (admin)' })
  @ApiResponse({ status: 200 })
  settle(@Param('matchId') matchId: string, @Body() dto: SettleQuizDto) {
    return this.quizService.settle(matchId, dto.winner);
  }

  @Get('history')
  @ApiOperation({ summary: '내 퀴즈 참여 이력' })
  getHistory(@Req() req: AuthenticatedRequest, @Query() query: QuizHistoryQueryDto) {
    return this.quizService.getHistory(req.user.sub, query.page, query.limit);
  }

  @Get('streak')
  @ApiOperation({ summary: '내 현재/최장 streak 조회' })
  getStreak(@Req() req: AuthenticatedRequest) {
    return this.quizService.getStreak(req.user.sub);
  }

  @Get('available')
  @ApiOperation({ summary: '오늘 참여 가능한 경기 목록' })
  getAvailable(@Req() req: AuthenticatedRequest) {
    return this.quizService.getAvailable(req.user.sub);
  }
}
