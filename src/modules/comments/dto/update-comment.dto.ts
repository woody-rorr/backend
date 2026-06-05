import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: '수정할 댓글 내용' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
