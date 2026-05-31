import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizQueryDto } from './dto/list-quiz-query.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, type: QuizResponseDto })
  create(@Body() dto: CreateQuizDto): Promise<QuizResponseDto> {
    return this.quizService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quizzes with pagination' })
  list(@Query() query: ListQuizQueryDto) {
    return this.quizService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, type: QuizResponseDto })
  getById(@Param('id', ParseIntPipe) id: number): Promise<QuizResponseDto> {
    return this.quizService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz (partial)' })
  @ApiResponse({ status: 200, type: QuizResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuizDto,
  ): Promise<QuizResponseDto> {
    return this.quizService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.quizService.remove(id);
  }
}
