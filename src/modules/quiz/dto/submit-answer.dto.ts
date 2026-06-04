import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ description: '제출할 답변', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  answer: string;
}

export class AnswerResultDto {
  @ApiProperty({ description: '생성된 답변 ID (uuid)' })
  answerId: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty({ description: '이번 답변으로 지급된 Spark' })
  sparkAwarded: number;

  @ApiProperty({ description: '갱신된 현재 연속 정답 수' })
  currentStreak: number;

  @ApiProperty({ description: '갱신된 최장 연속 정답 수' })
  longestStreak: number;
}
