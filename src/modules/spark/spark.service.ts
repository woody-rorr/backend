import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SparkRepository } from './spark.repository';
import { SparkEntity, SparkReason } from './entities/spark.entity';
import { SparkLevelEntity } from './entities/spark-level.entity';
import { AwardSparkDto, SparkHistoryQueryDto, SparkMeResponseDto, SparkResponseDto } from './dto/spark.dto';

const FIRST_VOYAGER_THRESHOLD = 100;
const FIXED_AMOUNT: Partial<Record<SparkReason, number>> = {
  [SparkReason.LOGIN]: 5,
  [SparkReason.BOOST_PRE]: 10,
  [SparkReason.BOOST_LIVE]: 10,
  [SparkReason.QUIZ]: 5,
};

@Injectable()
export class SparkService {
  private readonly logger = new Logger(SparkService.name);

  constructor(private readonly dataSource: DataSource, private readonly sparkRepo: SparkRepository) {}

  async getMe(userId: string): Promise<SparkMeResponseDto> {
    const level = await this.sparkRepo.findLevel(userId);
    return this.toMeResponse(userId, level);
  }

  async getHistory(userId: string, query: SparkHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.sparkRepo.findHistory(userId, page, limit);
    return { data: items.map((s) => this.toSparkResponse(s)), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async award(dto: AwardSparkDto): Promise<SparkMeResponseDto> {
    const amount = this.resolveAmount(dto.reason, dto.amount);
    if (dto.reason === SparkReason.LOGIN) {
      const since = this.startOfUtcDay();
      const already = await this.sparkRepo.countByReasonSince(dto.userId, SparkReason.LOGIN, since);
      if (already > 0) throw new HttpException({ code: 'DAILY_LOGIN_ALREADY_AWARDED', message: '오늘 로그인 Spark 는 이미 지급되었습니다' }, HttpStatus.CONFLICT);
    }
    let crossedFirstVoyager = false;
    const updatedLevel = await this.dataSource.transaction(async (mgr) => {
      const spark = mgr.create(SparkEntity, { userId: dto.userId, amount, reason: dto.reason });
      await mgr.save(spark);
      let level = await mgr.findOne(SparkLevelEntity, { where: { userId: dto.userId } });
      if (!level) level = mgr.create(SparkLevelEntity, { userId: dto.userId, totalSpark: 0, level: 1 });
      const before = level.totalSpark;
      level.addSpark(amount);
      await mgr.save(level);
      if (before < FIRST_VOYAGER_THRESHOLD && level.totalSpark >= FIRST_VOYAGER_THRESHOLD) crossedFirstVoyager = true;
      return level;
    });
    if (crossedFirstVoyager) this.logger.log(`First Voyager Profile Frame granted to user ${dto.userId}`);
    return this.toMeResponse(dto.userId, updatedLevel);
  }

  private resolveAmount(reason: SparkReason, amount?: number): number {
    if (reason === SparkReason.RANKING_REWARD) {
      if (amount === undefined || amount < 20 || amount > 3000) throw new HttpException({ code: 'INVALID_REWARD_AMOUNT', message: 'Ranking 보상은 20~3000 Spark' }, HttpStatus.UNPROCESSABLE_ENTITY);
      return amount;
    }
    const fixed = FIXED_AMOUNT[reason];
    if (fixed === undefined) throw new HttpException({ code: 'INVALID_SPARK_REASON', message: '알 수 없는 Spark 지급 사유' }, HttpStatus.UNPROCESSABLE_ENTITY);
    return fixed;
  }

  private startOfUtcDay(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private toMeResponse(userId: string, level: SparkLevelEntity | null): SparkMeResponseDto {
    const total = level?.totalSpark ?? 0;
    const lvl = level?.level ?? SparkLevelEntity.computeLevel(total);
    return { userId, totalSpark: total, level: lvl, levelName: SparkLevelEntity.levelName(lvl), nextLevelAt: SparkLevelEntity.nextLevelAt(total) };
  }

  private toSparkResponse(s: SparkEntity): SparkResponseDto {
    return { id: s.id, userId: s.userId, amount: s.amount, reason: s.reason, createdAt: s.createdAt.toISOString() };
  }
}
