import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from './entities/follow.entity';
import { FollowController } from './follow.controller';
import { FollowRepository } from './follow.repository';
import { FollowService } from './follow.service';

@Module({
  imports: [TypeOrmModule.forFeature([FollowEntity])],
  controllers: [FollowController],
  providers: [FollowService, FollowRepository],
  exports: [FollowService],
})
export class FollowModule {}
