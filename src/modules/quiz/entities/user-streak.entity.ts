import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_streaks')
export class UserStreak {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak: number = 0;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number = 0;

  @Column({ name: 'longest_streak_start_at', type: 'timestamptz', nullable: true })
  longestStreakStartAt: Date | null = null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  recordWin(at: Date): void {
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
      this.longestStreakStartAt = at;
    }
  }

  recordLoss(): void {
    this.currentStreak = 0;
  }
}
