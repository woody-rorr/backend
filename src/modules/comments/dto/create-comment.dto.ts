import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ format: 'uuid', description: '댓글을 달 게시물 ID' })
  @IsUUID()
  postId: string;

  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
