import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum SparkReason {
  LOGIN = 'LOGIN',
  BOOST_PRE = 'BOOST_PRE',
  BOOST_LIVE = 'BOOST_LIVE',
  QUIZ = 'QUIZ',
  RANKING_REWARD = 'RANKING_REWARD',
}

@Entity('sparks')
@Index('idx_sparks_user_id_created_at', ['userId', 'createdAt'])
export class SparkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  reason: SparkReason;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
