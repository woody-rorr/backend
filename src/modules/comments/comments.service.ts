import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async create(authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create({
      content: dto.content,
      postId: dto.postId,
      authorId,
    });
    return this.commentsRepository.save(comment);
  }

  findByPost(postId: string): Promise<Comment[]> {
    return this.commentsRepository.findByPostId(postId);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.getOwnedComment(id, userId);
    comment.content = dto.content;
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.getOwnedComment(id, userId);
    await this.commentsRepository.remove(comment);
  }

  private async getOwnedComment(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException({
        code: 'RESOURCE_NOT_FOUND',
        message: '댓글을 찾을 수 없습니다',
      });
    }
    if (comment.authorId !== userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: '권한이 없습니다',
      });
    }
    return comment;
  }
}
