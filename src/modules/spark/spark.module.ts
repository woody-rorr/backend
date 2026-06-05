import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spark } from './entities/spark.entity';
import { SparkTransaction } from './entities/spark-transaction.entity';
import { SparkController } from './spark.controller';
import { SparkRepository } from './spark.repository';
import { SparkService } from './spark.service';

@Module({
  imports: [TypeOrmModule.forFeature([Spark, SparkTransaction])],
  controllers: [SparkController],
  providers: [SparkService, SparkRepository],
  exports: [SparkService],
})
export class SparkModule {}
