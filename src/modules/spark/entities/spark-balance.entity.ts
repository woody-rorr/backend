import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export const SPARK_LEVEL_NAMES: Record<number, string> = {
  1: 'New Fan',
  2: 'Active Watcher',
  3: 'Rising Supporter',
  4: 'Core Fan',
  5: 'Strategic Booster',
  6: 'Super Fan',
  7: 'MVP Supporter',
  8: 'Legendary Fan',
  9: 'Honorary Captain',
  10: 'Hall of Fame',
};

@Entity('spark_balances')
export class SparkBalance {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'total_spark', type: 'integer', default: 0 })
  totalSpark: number;

  @Column({ type: 'integer', default: 1 })
  level: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  addSpark(amount: number): void {
    this.totalSpark = Math.max(0, this.totalSpark + amount);
    this.level = SparkBalance.levelFor(this.totalSpark);
  }

  static levelFor(total: number): number {
    if (total >= 30000) return 10;
    if (total >= 18000) return 9;
    if (total >= 10000) return 8;
    if (total >= 6000) return 7;
    if (total >= 3000) return 6;
    if (total >= 1500) return 5;
    if (total >= 700) return 4;
    if (total >= 300) return 3;
    if (total >= 100) return 2;
    return 1;
  }
}
