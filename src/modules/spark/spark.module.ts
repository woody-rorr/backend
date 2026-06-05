import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SparkEntity } from './entities/spark.entity';
import { SparkController } from './spark.controller';
import { SparkService } from './spark.service';
import { SparkRepository } from './spark.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SparkEntity])],
  controllers: [SparkController],
  providers: [SparkService, SparkRepository],
  exports: [SparkService],
})
export class SparkModule {}