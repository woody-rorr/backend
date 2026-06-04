import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { QuizEntry } from './entities/quiz-entry.entity';
import { UserStreak } from './entities/user-streak.entity';
import { SparkModule } from '../spark/spark.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuizEntry, UserStreak]), SparkModule],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository],
  exports: [QuizService],
})
export class QuizModule {}
