import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Energy } from './entities/energy.entity';
import { EnergyTransaction } from './entities/energy-transaction.entity';
import { EnergyController } from './energy.controller';
import { EnergyService } from './energy.service';
import { EnergyRepository } from './energy.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Energy, EnergyTransaction])],
  controllers: [EnergyController],
  providers: [EnergyService, EnergyRepository],
  exports: [EnergyService],
})
export class EnergyModule {}
