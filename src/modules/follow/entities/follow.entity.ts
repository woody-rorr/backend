import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum FollowTargetType {
  LEAGUE = 'league',
  TEAM = 'team',
  PLAYER = 'player',
}

export const FOLLOW_LIMITS: Record<FollowTargetType, number> = {
  [FollowTargetType.LEAGUE]: 3,
  [FollowTargetType.TEAM]: 6,
  [FollowTargetType.PLAYER]: 12,
};

@Entity('follows')
@Unique('uq_follows_user_id_target_type_target_id', ['userId','targetType','targetId'])
@Index('idx_follows_user_id_target_type', ['userId', 'targetType'])
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'target_type', type: 'varchar', length: 20 })
  targetType: FollowTargetType;

  @Column({ name: 'target_id', type: 'varchar', length: 255 })
  targetId: string;

  @Column({ name: 'target_name', type: 'varchar', length: 255 })
  targetName: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  static create(userId: string, targetType: FollowTargetType, targetId: string, targetName: string): FollowEntity {
    const follow = new FollowEntity();
    follow.userId = userId;
    follow.targetType = targetType;
    follow.targetId = targetId;
    follow.targetName = targetName;
    return follow;
  }

  static limitFor(targetType: FollowTargetType): number {
    return FOLLOW_LIMITS[targetType];
  }
}
