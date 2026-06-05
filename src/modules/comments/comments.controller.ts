import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  async create(
    @Req() req: any,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(req.user.sub, dto);
    return new CommentResponseDto(comment);
  }

  @Get()
  @ApiOperation({ summary: '특정 게시물의 댓글 목록' })
  @ApiQuery({ name: 'postId', required: true, type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  async findByPost(
    @Query('postId', new ParseUUIDPipe()) postId: string,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findByPost(postId);
    return comments.map((c) => new CommentResponseDto(c));
  }

  @Patch(':id')
  @ApiOperation({ summary: '댓글 수정 (본인만)' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN' })
  @ApiResponse({ status: 404, description: 'RESOURCE_NOT_FOUND' })
  async update(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(id, req.user.sub, dto);
    return new CommentResponseDto(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: '댓글 삭제 (본인만)' })
  @ApiResponse({ status: 200, schema: { properties: { success: { type: 'boolean' } } } })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN' })
  @ApiResponse({ status: 404, description: 'RESOURCE_NOT_FOUND' })
  async remove(
    @Req() req: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ success: boolean }> {
    await this.commentsService.remove(id, req.user.sub);
    return { success: true };
  }
}
