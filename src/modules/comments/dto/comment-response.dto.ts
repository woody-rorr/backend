import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../entities/comment.entity';

export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ format: 'uuid' })
  authorId: string;

  @ApiProperty({ format: 'uuid' })
  postId: string;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.authorId = comment.authorId;
    this.postId = comment.postId;
    this.createdAt = comment.createdAt?.toISOString();
    this.updatedAt = comment.updatedAt?.toISOString();
  }
}
