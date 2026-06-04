import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { Quiz } from './entities/quiz.entity';
import { UserQuizAnswer } from './entities/user-quiz-answer.entity';
import { UserStreak } from './entities/user-streak.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, UserQuizAnswer, UserStreak])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService],
})
export class QuizModule {}
