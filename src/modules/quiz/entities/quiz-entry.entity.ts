import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuizPrediction {
  BLUE = 'BLUE',
  RED = 'RED',
}

export enum QuizResult {
  WIN = 'WIN',
  LOSE = 'LOSE',
  PENDING = 'PENDING',
}

@Entity('quiz_entries')
@Index('uq_quiz_entries_user_id_match_id', ['userId', 'matchId'], { unique: true })
@Index('idx_quiz_entries_match_id', ['matchId'])
export class QuizEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'match_id', type: 'varchar', length: 255 })
  matchId: string;

  @Column({ type: 'varchar', length: 8 })
  prediction: QuizPrediction;

  @Column({ type: 'varchar', length: 8, default: QuizResult.PENDING })
  result: QuizResult = QuizResult.PENDING;

  @Column({ type: 'int', default: 0 })
  streak: number = 0;

  @Column({ name: 'spark_granted', type: 'boolean', default: false })
  sparkGranted: boolean = false;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  settle(correct: boolean, streakAtSettlement: number): void {
    if (this.result !== QuizResult.PENDING) {
      throw new Error('Quiz entry already settled');
    }
    this.result = correct ? QuizResult.WIN : QuizResult.LOSE;
    this.streak = streakAtSettlement;
  }
}
