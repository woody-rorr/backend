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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Public } from '../../common/decorators/public.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PostResponseDto } from './dto/post-response.dto';

type AuthenticatedRequest = Request & { user: JwtPayload };

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, type: PostResponseDto })
  create(@Body() dto: CreatePostDto, @Req() req: AuthenticatedRequest) {
    return this.postsService.create({ authorId: req.user.sub, title: dto.title, content: dto.content });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List posts' })
  @ApiResponse({ status: 200, type: [PostResponseDto] })
  list(@Query() query: PaginationDto) { return this.postsService.list(query); }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  findById(@Param('id', ParseUUIDPipe) id: string) { return this.postsService.findById(id); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (author only)' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePostDto, @Req() req: AuthenticatedRequest) {
    return this.postsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a post (author only)' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.postsService.softDelete(id, req.user.sub);
  }
}
