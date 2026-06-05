import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: '게시글 제목', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '게시글 본문' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '작성자', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;
}
