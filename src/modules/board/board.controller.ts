import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  BoardListResponseDto,
  BoardResponseDto,
  ListBoardsQueryDto,
} from './dto/board-response.dto';

@ApiTags('boards')
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '게시글 생성' })
  @ApiCreatedResponse({ type: BoardResponseDto })
  create(@Body() dto: CreateBoardDto): Promise<BoardResponseDto> {
    return this.boardService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회 (페이징)' })
  @ApiOkResponse({ type: BoardListResponseDto })
  findAll(@Query() query: ListBoardsQueryDto): Promise<BoardListResponseDto> {
    return this.boardService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 단건 조회' })
  @ApiOkResponse({ type: BoardResponseDto })
  @ApiNotFoundResponse({ description: 'BOARD_NOT_FOUND' })
  findOne(@Param('id') id: string): Promise<BoardResponseDto> {
    return this.boardService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiOkResponse({ type: BoardResponseDto })
  @ApiNotFoundResponse({ description: 'BOARD_NOT_FOUND' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    return this.boardService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'BOARD_NOT_FOUND' })
  remove(@Param('id') id: string): Promise<void> {
    return this.boardService.remove(id);
  }
}
