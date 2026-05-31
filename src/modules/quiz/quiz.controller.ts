import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QueryQuizDto, RandomQuizDto } from './dto/query-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: '퀴즈 생성' })
  @ApiCreatedResponse({ type: QuizResponseDto })
  create(@Body() dto: CreateQuizDto): Promise<QuizResponseDto> {
    return this.quizService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '퀴즈 목록 조회' })
  @ApiOkResponse({ type: [QuizResponseDto] })
  findAll(@Query() query: QueryQuizDto): Promise<QuizResponseDto[]> {
    return this.quizService.findAll(query);
  }

  @Get('random')
  @ApiOperation({ summary: '랜덤 퀴즈 1개 조회' })
  @ApiOkResponse({ type: QuizResponseDto })
  findRandom(@Query() query: RandomQuizDto): Promise<QuizResponseDto> {
    return this.quizService.findRandom(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '퀴즈 ID로 조회' })
  @ApiOkResponse({ type: QuizResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<QuizResponseDto> {
    return this.quizService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '퀴즈 수정' })
  @ApiOkResponse({ type: QuizResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    return this.quizService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '퀴즈 삭제' })
  @ApiNoContentResponse()
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.quizService.remove(id);
  }
}
