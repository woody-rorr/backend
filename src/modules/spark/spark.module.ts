import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SparkController } from './spark.controller';
import { SparkService } from './spark.service';
import { SparkRepository } from './spark.repository';
import { SparkTransaction } from './entities/spark-transaction.entity';
import { SparkBalance } from './entities/spark-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SparkTransaction, SparkBalance])],
  controllers: [SparkController],
  providers: [SparkService, SparkRepository],
  exports: [SparkService],
})
export class SparkModule {}
