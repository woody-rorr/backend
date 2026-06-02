import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { QuizService } from './quiz.service';
import {
  SubmitQuizDto,
  SettleQuizDto,
  QuizHistoryQueryDto,
  QuizEntryResponseDto,
  QuizStreakResponseDto,
} from './dto/quiz.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '승패 예측 제출 (같은 userId+matchId 중복 불가)' })
  @ApiResponse({ status: 201, type: QuizEntryResponseDto })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 409, description: '이미 참여한 경기' })
  submit(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitQuizDto,
  ): Promise<QuizEntryResponseDto> {
    return this.quizService.submit(req.user.sub, dto);
  }

  @Post('settle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '정산 처리 (actualWinner로 isCorrect 및 Streak 갱신)' })
  @ApiResponse({ status: 200, type: QuizEntryResponseDto })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 404, description: '참여 이력 없음' })
  @ApiResponse({ status: 409, description: '이미 정산됨' })
  settle(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SettleQuizDto,
  ): Promise<QuizEntryResponseDto> {
    return this.quizService.settle(req.user.sub, dto);
  }

  @Get('history')
  @ApiOperation({ summary: '퀴즈 참여 이력 (페이지네이션)' })
  @ApiResponse({ status: 200, description: '{ data: QuizEntryResponseDto[], meta }' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  history(
    @Req() req: AuthenticatedRequest,
    @Query() query: QuizHistoryQueryDto,
  ) {
    return this.quizService.history(req.user.sub, query);
  }

  @Get('streak')
  @ApiOperation({ summary: '현재 Streak 및 최장 Streak 조회' })
  @ApiResponse({ status: 200, type: QuizStreakResponseDto })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  getStreak(@Req() req: AuthenticatedRequest): Promise<QuizStreakResponseDto> {
    return this.quizService.getStreak(req.user.sub);
  }
}
