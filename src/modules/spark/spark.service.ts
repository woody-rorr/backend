import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { SparkRepository } from './spark.repository';
import { SparkTransaction, SparkReason } from './entities/spark-transaction.entity';
import { SparkBalance, SPARK_LEVEL_NAMES } from './entities/spark-balance.entity';
import { GrantSparkDto, SparkHistoryQueryDto } from './dto/spark.dto';

interface AuthUser {
  sub: string;
  roles?: string[];
}

const LOGIN_DAILY_REWARD = 5;

@Injectable()
export class SparkService {
  constructor(
    private readonly repo: SparkRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getBalance(userId: string) {
    const balance = await this.repo.findBalance(userId);
    const total = balance?.totalSpark ?? 0;
    const level = balance?.level ?? 1;
    return {
      userId,
      totalSpark: total,
      level,
      levelName: SPARK_LEVEL_NAMES[level],
      updatedAt: balance?.updatedAt ? balance.updatedAt.toISOString() : null,
    };
  }

  async getHistory(userId: string, query: SparkHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.repo.findHistory(userId, page, limit, query.reason);
    return {
      data: items.map((t) => this.toTxResponse(t)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async grant(actor: AuthUser, dto: GrantSparkDto) {
    const roles = actor?.roles ?? [];
    if (!roles.includes('admin') && !roles.includes('service')) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: '권한이 없습니다.' },
        HttpStatus.FORBIDDEN,
      );
    }
    const result = await this.dataSource.transaction((manager) =>
      this.applyGrant(manager, dto.userId, dto.amount, dto.reason, dto.description ?? null),
    );
    return this.toGrantResponse(result);
  }

  async loginDaily(userId: string) {
    const already = await this.repo.existsLoginDailyToday(userId);
    if (already) {
      throw new HttpException(
        { code: 'LOGIN_DAILY_ALREADY_CLAIMED', message: '오늘 로그인 보상을 이미 받았습니다.' },
        HttpStatus.CONFLICT,
      );
    }
    try {
      const result = await this.dataSource.transaction((manager) =>
        this.applyGrant(
          manager,
          userId,
          LOGIN_DAILY_REWARD,
          SparkReason.LOGIN_DAILY,
          'Daily login reward',
        ),
      );
      return this.toGrantResponse(result);
    } catch (e) {
      if (e instanceof QueryFailedError && /uq_spark_transactions_login_daily/.test(e.message)) {
        throw new HttpException(
          { code: 'LOGIN_DAILY_ALREADY_CLAIMED', message: '오늘 로그인 보상을 이미 받았습니다.' },
          HttpStatus.CONFLICT,
        );
      }
      throw e;
    }
  }

  private async applyGrant(
    manager: EntityManager,
    userId: string,
    amount: number,
    reason: SparkReason,
    description: string | null,
  ): Promise<{ tx: SparkTransaction; balance: SparkBalance }> {
    const txRepo = manager.getRepository(SparkTransaction);
    const balRepo = manager.getRepository(SparkBalance);

    const tx = txRepo.create({ userId, amount, reason, description });
    await txRepo.save(tx);

    let balance = await balRepo.findOne({ where: { userId } });
    if (!balance) {
      balance = balRepo.create({ userId, totalSpark: 0, level: 1 });
    }
    balance.addSpark(amount);
    await balRepo.save(balance);

    return { tx, balance };
  }

  private toTxResponse(t: SparkTransaction) {
    return {
      id: t.id,
      userId: t.userId,
      amount: t.amount,
      reason: t.reason,
      description: t.description,
      createdAt: t.createdAt.toISOString(),
    };
  }

  private toGrantResponse(result: { tx: SparkTransaction; balance: SparkBalance }) {
    return {
      transaction: this.toTxResponse(result.tx),
      balance: {
        userId: result.balance.userId,
        totalSpark: result.balance.totalSpark,
        level: result.balance.level,
        levelName: SPARK_LEVEL_NAMES[result.balance.level],
      },
    };
  }
}
