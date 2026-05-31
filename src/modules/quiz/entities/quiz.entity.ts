import { UnprocessableEntityException } from '@nestjs/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

@Entity({ name: 'quizzes' })
export class Quiz {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'question', type: 'varchar', length: 500, nullable: false })
  question: string;

  @Column({ name: 'options', type: 'jsonb' })
  options: string[];

  @Column({ name: 'correct_answer', type: 'varchar', length: 500 })
  correctAnswer: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string;

  @Column({ name: 'difficulty', type: 'varchar', length: 20 })
  difficulty: QuizDifficulty;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  ensureCorrectAnswerInOptions(): void {
    if (!Array.isArray(this.options) || !this.options.includes(this.correctAnswer)) {
      throw new UnprocessableEntityException({
        code: 'INVALID_CORRECT_ANSWER',
        message: 'correctAnswer 는 options 배열에 포함되어야 합니다',
      });
    }
  }
}
