import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { QuizEntry } from './entities/quiz-entry.entity';
import { QuizStreak } from './entities/quiz-streak.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntry, QuizStreak])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService],
})
export class QuizModule {}
