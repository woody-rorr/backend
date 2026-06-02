import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowEntity, FollowTargetType } from './entities/follow.entity';
import { FollowRepository } from './follow.repository';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateFollowDto): Promise<FollowResponseDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      const existing = await this.followRepository.findExisting(userId, dto.targetType, dto.targetId, manager);
      if (existing) {
        throw new HttpException({ code: 'ALREADY_FOLLOWING', message: '이미 follow 중인 대상입니다' }, HttpStatus.CONFLICT);
      }
      const count = await this.followRepository.countByType(userId, dto.targetType, manager);
      const limit = FollowEntity.limitFor(dto.targetType);
      if (count >= limit) {
        throw new HttpException({ code: 'FOLLOW_LIMIT_EXCEEDED', message: `${dto.targetType} follow 한도(${limit})를 초과했습니다`, details: { targetType: dto.targetType, limit, current: count } }, HttpStatus.BAD_REQUEST);
      }
      const entity = FollowEntity.create(userId, dto.targetType, dto.targetId, dto.targetName);
      return this.followRepository.save(entity, manager);
    });
    return FollowResponseDto.from(saved);
  }

  async findAll(userId: string): Promise<FollowResponseDto[]> {
    const rows = await this.followRepository.findAllByUser(userId);
    return rows.map((row) => FollowResponseDto.from(row));
  }

  async findByType(userId: string, targetType: FollowTargetType): Promise<FollowResponseDto[]> {
    const rows = await this.followRepository.findByUserAndType(userId, targetType);
    return rows.map((row) => FollowResponseDto.from(row));
  }

  async remove(userId: string, targetType: FollowTargetType, targetId: string): Promise<void> {
    const affected = await this.followRepository.deleteOne(userId, targetType, targetId);
    if (affected === 0) {
      throw new HttpException({ code: 'FOLLOW_NOT_FOUND', message: 'follow 대상을 찾을 수 없습니다' }, HttpStatus.NOT_FOUND);
    }
  }
}
