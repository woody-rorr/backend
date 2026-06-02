import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quiz_entries')
@Unique('uq_quiz_entries_user_id_match_id', ['userId', 'matchId'])
export class QuizEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_quiz_entries_user_id')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'match_id', type: 'varchar', length: 255 })
  matchId: string;

  @Column({ name: 'predicted_winner', type: 'varchar', length: 255 })
  predictedWinner: string;

  @Column({ name: 'actual_winner', type: 'varchar', length: 255, nullable: true })
  actualWinner: string | null;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  get isSettled(): boolean {
    return this.actualWinner !== null && this.actualWinner !== undefined;
  }

  settle(actualWinner: string): void {
    this.actualWinner = actualWinner;
    this.isCorrect = this.predictedWinner === actualWinner;
  }
}
