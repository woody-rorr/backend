import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SparkRepository } from './spark.repository';
import { EarnSparkDto } from './dto/earn-spark.dto';
import { SpendSparkDto } from './dto/spend-spark.dto';
import { SparkResponseDto } from './dto/spark-response.dto';

@Injectable()
export class SparkService {
  private readonly logger = new Logger(SparkService.name);

  constructor(
    private readonly sparkRepository: SparkRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getBalance(userId: string): Promise<SparkResponseDto> {
    const spark = await this.sparkRepository.findByUserId(userId);
    return spark ? SparkResponseDto.from(spark) : SparkResponseDto.zero(userId);
  }

  async earnSpark(userId: string, dto: EarnSparkDto): Promise<SparkResponseDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      let spark = await this.sparkRepository.findByUserIdForUpdate(manager, userId);
      if (!spark) {
        spark = this.sparkRepository.createForUser(manager, userId);
      }
      spark.earn(dto.amount);
      return this.sparkRepository.save(manager, spark);
    });

    this.logger.log(
      JSON.stringify({
        event: 'spark.earned',
        userId,
        amount: dto.amount,
        reason: dto.reason,
        balance: saved.amount,
      }),
    );
    return SparkResponseDto.from(saved);
  }

  async spendSpark(userId: string, dto: SpendSparkDto): Promise<SparkResponseDto> {
    const saved = await this.dataSource.transaction(async (manager) => {
      let spark = await this.sparkRepository.findByUserIdForUpdate(manager, userId);
      if (!spark) {
        spark = this.sparkRepository.createForUser(manager, userId);
      }
      spark.spend(dto.amount);
      return this.sparkRepository.save(manager, spark);
    });

    this.logger.log(
      JSON.stringify({
        event: 'spark.spent',
        userId,
        amount: dto.amount,
        reason: dto.reason,
        balance: saved.amount,
      }),
    );
    return SparkResponseDto.from(saved);
  }
}