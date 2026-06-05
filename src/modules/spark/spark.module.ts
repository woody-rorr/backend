import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SparkService } from './spark.service';
import { SparkTransaction } from './spark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SparkTransaction])],
  providers: [SparkService],
  exports: [SparkService],
})
export class SparkModule {}
