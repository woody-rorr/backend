import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { QuizService } from './quiz.service';
import { SubmitAnswerDto, AnswerResultDto } from './dto/submit-answer.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { StreakResponseDto } from './dto/streak-response.dto';
import { RankingResponseDto } from './dto/ranking-response.dto';
import { PaginationQueryDto, RankingQueryDto } from './dto/query-quiz.dto';

type AuthedRequest = { user: { sub: string } };

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('active')
  @ApiOperation({ summary: '현재 활성 퀴즈 목록 조회' })
  @ApiResponse({ status: 200, type: [QuizResponseDto] })
  getActive(@Req() req: AuthedRequest): Promise<QuizResponseDto[]> {
    return this.quizService.getActiveQuizzes(req.user.sub);
  }

  @Get('my-answers')
  @ApiOperation({ summary: '내 답변 이력' })
  @ApiResponse({ status: 200 })
  getMyAnswers(@Req() req: AuthedRequest, @Query() query: PaginationQueryDto) {
    return this.quizService.getMyAnswers(req.user.sub, query);
  }

  @Get('streak')
  @ApiOperation({ summary: '내 Streak 정보' })
  @ApiResponse({ status: 200, type: StreakResponseDto })
  getStreak(@Req() req: AuthedRequest): Promise<StreakResponseDto> {
    return this.quizService.getStreak(req.user.sub);
  }

  @Get('ranking')
  @ApiOperation({ summary: '최장 Streak 랭킹 (월간/전체)' })
  @ApiResponse({ status: 200, type: [RankingResponseDto] })
  getRanking(@Query() query: RankingQueryDto) {
    return this.quizService.getRanking(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 퀴즈 상세' })
  @ApiResponse({ status: 200, type: QuizResponseDto })
  @ApiResponse({ status: 404, description: 'QUIZ_NOT_FOUND' })
  getOne(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QuizResponseDto> {
    return this.quizService.getQuiz(req.user.sub, id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: '답변 제출' })
  @ApiResponse({ status: 201, type: AnswerResultDto })
  @ApiResponse({ status: 404, description: 'QUIZ_NOT_FOUND' })
  @ApiResponse({ status: 409, description: 'ALREADY_ANSWERED' })
  @ApiResponse({ status: 422, description: 'QUIZ_DEADLINE_PASSED' })
  submitAnswer(
    @Req() req: AuthedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAnswerDto,
  ): Promise<AnswerResultDto> {
    return this.quizService.submitAnswer(req.user.sub, id, dto);
  }
}
