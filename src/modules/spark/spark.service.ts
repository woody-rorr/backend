import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Spark } from './entities/spark.entity';
import {
  SparkTransaction,
  SparkTransactionType,
} from './entities/spark-transaction.entity';
import { SparkRepository } from './spark.repository';
import {
  DailyLoginResponseDto,
  GrantSparkDto,
  GrantSparkResponseDto,
  SparkResponseDto,
  SparkTransactionListResponseDto,
  SparkTransactionQueryDto,
  SparkTransactionResponseDto,
} from './dto/spark.dto';

export interface SparkActor {
  sub: string;
  roles?: string[];
}

@Injectable()
export class SparkService {
  private readonly logger = new Logger(SparkService.name);
  private readonly DAILY_LOGIN_SPARK = 10;
  private readonly REWARD_THRESHOLD = 100;

  constructor(
    private readonly dataSource: DataSource,
    private readonly sparkRepository: SparkRepository,
  ) {}

  async getBalance(userId: string): Promise<SparkResponseDto> {
    const account = await this.ensureAccount(userId);
    return this.toSparkResponse(account);
  }

  async getTransactions(
    userId: string,
    query: SparkTransactionQueryDto,
  ): Promise<SparkTransactionListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [rows, total] = await this.sparkRepository.findTransactions(userId, page, limit);
    return {
      items: rows.map((r) => this.toTransactionResponse(r)),
      total,
      page,
      limit,
    };
  }

  async grant(actor: SparkActor, dto: GrantSparkDto): Promise<GrantSparkResponseDto> {
    if (!actor.roles?.includes('admin')) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '권한이 없습니다' });
    }
    return this.grantInternal(dto);
  }

  async dailyLogin(userId: string): Promise<DailyLoginResponseDto> {
    const dailyKey = this.buildDailyKey(userId, SparkTransactionType.LOGIN);
    const existing = await this.sparkRepository.findByDailyKey(dailyKey);
    if (existing) {
      return { granted: false, transaction: null, message: '오늘 로그인 보상을 이미 받았습니다' };
    }
    try {
      const result = await this.grantInternal(
        {
          userId,
          amount: this.DAILY_LOGIN_SPARK,
          type: SparkTransactionType.LOGIN,
          reason: '일일 로그인 보상',
        },
        dailyKey,
      );
      return {
        granted: true,
        transaction: result.transaction,
        message: '로그인 보상이 지급되었습니다',
      };
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === HttpStatus.CONFLICT) {
        return { granted: false, transaction: null, message: '오늘 로그인 보상을 이미 받았습니다' };
      }
      throw err;
    }
  }

  private async grantInternal(
    dto: GrantSparkDto,
    dailyKey?: string,
  ): Promise<GrantSparkResponseDto> {
    const { transaction, previousBalance, newBalance } = await this.dataSource.transaction(
      async (manager) => {
        const sparkRepo = manager.getRepository(Spark);
        const txRepo = manager.getRepository(SparkTransaction);

        if (dailyKey) {
          const dup = await txRepo.findOne({ where: { dailyKey } });
          if (dup) {
            throw new HttpException(
              { code: 'SPARK_ALREADY_GRANTED', message: '이미 지급된 보상입니다' },
              HttpStatus.CONFLICT,
            );
          }
        } else if (dto.referenceId && dto.referenceType) {
          const dup = await txRepo.findOne({
            where: {
              userId: dto.userId,
              referenceId: dto.referenceId,
              referenceType: dto.referenceType,
            },
          });
          if (dup) {
            throw new HttpException(
              { code: 'SPARK_ALREADY_GRANTED', message: '이미 지급된 내역입니다' },
              HttpStatus.CONFLICT,
            );
          }
        }

        let account = await sparkRepo.findOne({ where: { userId: dto.userId } });
        if (!account) {
          account = sparkRepo.create({ userId: dto.userId, totalSpark: 0 });
          account = await sparkRepo.save(account);
        }
        const prev = account.totalSpark;
        account.totalSpark = prev + dto.amount;
        await sparkRepo.save(account);

        const tx = txRepo.create({
          sparkId: account.id,
          userId: dto.userId,
          amount: dto.amount,
          type: dto.type,
          reason: dto.reason,
          referenceId: dto.referenceId ?? null,
          referenceType: dto.referenceType ?? null,
          dailyKey: dailyKey ?? null,
        });
        const saved = await txRepo.save(tx);
        return { transaction: saved, previousBalance: prev, newBalance: account.totalSpark };
      },
    );

    // emit (트랜잭션 commit 이후): 100 Spark 달성 시 리워드 트리거
    if (previousBalance < this.REWARD_THRESHOLD && newBalance >= this.REWARD_THRESHOLD) {
      this.logger.log(
        `[reward-trigger] user=${dto.userId} reached ${newBalance} spark (threshold=${this.REWARD_THRESHOLD})`,
      );
    }

    return { transaction: this.toTransactionResponse(transaction), newBalance };
  }

  private async ensureAccount(userId: string): Promise<Spark> {
    const existing = await this.sparkRepository.findAccountByUserId(userId);
    if (existing) return existing;
    return this.sparkRepository.createAccount(userId);
  }

  private buildDailyKey(userId: string, type: SparkTransactionType): string {
    const today = new Date().toISOString().slice(0, 10);
    return `${userId}:${type}:${today}`;
  }

  private toSparkResponse(account: Spark): SparkResponseDto {
    return {
      userId: account.userId,
      totalSpark: account.totalSpark,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  private toTransactionResponse(tx: SparkTransaction): SparkTransactionResponseDto {
    return {
      id: tx.id,
      userId: tx.userId,
      amount: tx.amount,
      type: tx.type,
      reason: tx.reason,
      referenceId: tx.referenceId,
      referenceType: tx.referenceType,
      createdAt: tx.createdAt.toISOString(),
    };
  }
}
