import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ minLength: 1, maxLength: 200, example: 'My first post' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ minLength: 1, example: 'Hello world.' })
  @IsString()
  @MinLength(1)
  content: string;
}
