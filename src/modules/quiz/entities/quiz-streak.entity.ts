import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quiz_streaks')
@Unique('uq_quiz_streaks_user_id', ['userId'])
export class QuizStreak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number;

  @Column({ name: 'last_match_id', type: 'varchar', length: 255, nullable: true })
  lastMatchId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  applyResult(isCorrect: boolean, matchId: string): void {
    if (isCorrect) {
      this.currentStreak += 1;
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak;
      }
    } else {
      this.currentStreak = 0;
    }
    this.lastMatchId = matchId;
  }
}
