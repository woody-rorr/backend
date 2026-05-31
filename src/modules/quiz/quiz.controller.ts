import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QueryQuizDto } from './dto/query-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create quiz' })
  @ApiResponse({ status: 201, type: QuizResponseDto })
  create(@Body() dto: CreateQuizDto): Promise<QuizResponseDto> {
    return this.quizService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List quizzes' })
  @ApiResponse({ status: 200, type: [QuizResponseDto] })
  findAll(@Query() query: QueryQuizDto) {
    return this.quizService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by id' })
  @ApiResponse({ status: 200, type: QuizResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<QuizResponseDto> {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({ status: 200, type: QuizResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    return this.quizService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.quizService.remove(id);
  }
}
