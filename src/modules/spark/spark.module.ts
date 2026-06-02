import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SparkController } from './spark.controller';
import { SparkService } from './spark.service';
import { SparkRepository } from './spark.repository';
import { SparkEntity } from './entities/spark.entity';
import { SparkLevelEntity } from './entities/spark-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SparkEntity, SparkLevelEntity])],
  controllers: [SparkController],
  providers: [SparkService, SparkRepository],
  exports: [SparkService],
})
export class SparkModule {}
