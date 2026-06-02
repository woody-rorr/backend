import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

export const SPARK_LEVEL_BOUNDS = [100, 300, 700, 1500, 3000, 6000, 10000, 18000, 30000];

@Entity('spark_levels')
@Unique('uq_spark_levels_user_id', ['userId'])
export class SparkLevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'total_spark', type: 'int', default: 0 })
  totalSpark: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  addSpark(amount: number): void {
    if (amount <= 0) throw new Error('Spark amount must be positive');
    this.totalSpark += amount;
    this.level = SparkLevelEntity.computeLevel(this.totalSpark);
  }

  static computeLevel(total: number): number {
    let level = 1;
    for (let i = 0; i < SPARK_LEVEL_BOUNDS.length; i++) {
      if (total >= SPARK_LEVEL_BOUNDS[i]) level = i + 2;
    }
    return level;
  }

  static levelName(level: number): string {
    return level >= 10 ? 'HallOfFame' : `Lv${level}`;
  }

  static nextLevelAt(total: number): number | null {
    for (const bound of SPARK_LEVEL_BOUNDS) {
      if (total < bound) return bound;
    }
    return null;
  }
}
