import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: '블로그 포스트 생성' })
  @ApiCreatedResponse({ type: Blog })
  create(@Body() dto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '블로그 목록 조회 (페이징, 필터링)' })
  findAll(@Query() query: QueryBlogDto): Promise<{ items: Blog[]; total: number }> {
    return this.blogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '블로그 상세 조회 (조회수 증가)' })
  @ApiOkResponse({ type: Blog })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Blog> {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '블로그 수정' })
  @ApiOkResponse({ type: Blog })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBlogDto,
  ): Promise<Blog> {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '블로그 삭제' })
  @ApiOkResponse({ schema: { properties: { deleted: { type: 'boolean' } } } })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.blogService.remove(id);
    return { deleted };
  }

  @Post(':id/view')
  @HttpCode(200)
  @ApiOperation({ summary: '조회수 증가' })
  @ApiOkResponse({ schema: { properties: { viewCount: { type: 'number' } } } })
  async incrementView(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ viewCount: number }> {
    const viewCount = await this.blogService.incrementView(id);
    return { viewCount };
  }
}
