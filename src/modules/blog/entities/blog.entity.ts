import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('blogs')
export class Blog {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ maxLength: 200 })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ maxLength: 100 })
  @Column({ type: 'varchar', length: 100 })
  author: string;

  @ApiPropertyOptional({ maxLength: 100, nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @ApiProperty({ type: [String], default: [] })
  @Column({ type: 'jsonb', default: () => "'[]'" })
  tags: string[];

  @ApiProperty({ default: false })
  @Column({ type: 'boolean', default: false })
  published: boolean;

  @ApiProperty({ default: 0 })
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  /**
   * 조회수 1 증가 (불변식: viewCount는 음수가 될 수 없음 — 단조 증가).
   */
  incrementView(): void {
    this.viewCount += 1;
  }
}
