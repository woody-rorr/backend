import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Energy } from './entities/energy.entity';
import { EnergyTransaction } from './entities/energy-transaction.entity';

@Injectable()
export class EnergyRepository {
  constructor(
    @InjectRepository(Energy) private readonly energy: Repository<Energy>,
    @InjectRepository(EnergyTransaction) private readonly tx: Repository<EnergyTransaction>,
  ) {}

  findByUserId(userId: string): Promise<Energy | null> {
    return this.energy.findOne({ where: { userId } });
  }

  async createAccount(userId: string): Promise<Energy> {
    const account = this.energy.create({
      userId,
      balance: 0,
      totalPurchased: 0,
      totalSpent: 0,
    });
    return this.energy.save(account);
  }

  findTransactions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<[EnergyTransaction[], number]> {
    return this.tx.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
