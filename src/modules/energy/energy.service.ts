import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Energy } from './entities/energy.entity';
import { EnergyTransaction } from './entities/energy-transaction.entity';
import { EnergyRepository } from './energy.repository';
import { ConsumeEnergyDto, PurchaseEnergyDto, QueryTransactionsDto } from './dto/energy.dto';

@Injectable()
export class EnergyService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly energyRepo: EnergyRepository,
  ) {}

  async getBalance(userId: string): Promise<Energy> {
    const existing = await this.energyRepo.findByUserId(userId);
    if (existing) return existing;
    return this.energyRepo.createAccount(userId);
  }

  async getTransactions(userId: string, query: QueryTransactionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.energyRepo.findTransactions(userId, page, limit);
    return { items, total, page, limit };
  }

  async purchase(userId: string, dto: PurchaseEnergyDto) {
    return this.dataSource.transaction(async (manager) => {
      const energyTx = manager.getRepository(Energy);
      const txRepo = manager.getRepository(EnergyTransaction);

      const dup = await txRepo.findOne({ where: { paymentId: dto.paymentId } });
      if (dup) {
        throw new HttpException(
          { code: 'PAYMENT_ALREADY_PROCESSED', message: '이미 처리된 결제입니다' },
          HttpStatus.CONFLICT,
        );
      }

      let energy = await energyTx.findOne({
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!energy) {
        energy = energyTx.create({ userId, balance: 0, totalPurchased: 0, totalSpent: 0 });
        energy = await energyTx.save(energy);
      }

      energy.purchase(dto.amount);
      await energyTx.save(energy);

      const tx = txRepo.create({
        userId,
        type: 'PURCHASE',
        amount: dto.amount,
        balanceAfter: energy.balance,
        reason: 'PURCHASE',
        paymentId: dto.paymentId,
        referenceId: null,
        referenceType: null,
      });
      const saved = await txRepo.save(tx);
      return { transaction: saved, newBalance: energy.balance };
    });
  }

  async consume(dto: ConsumeEnergyDto) {
    return this.dataSource.transaction(async (manager) => {
      const energyTx = manager.getRepository(Energy);
      const txRepo = manager.getRepository(EnergyTransaction);

      const energy = await energyTx.findOne({
        where: { userId: dto.userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!energy || !energy.consume(dto.amount)) {
        throw new HttpException(
          { code: 'INSUFFICIENT_BALANCE', message: 'Energy 잔액이 부족합니다' },
          HttpStatus.CONFLICT,
        );
      }
      await energyTx.save(energy);

      const tx = txRepo.create({
        userId: dto.userId,
        type: dto.type,
        amount: dto.amount,
        balanceAfter: energy.balance,
        reason: dto.reason,
        paymentId: null,
        referenceId: dto.referenceId ?? null,
        referenceType: dto.referenceType ?? null,
      });
      const saved = await txRepo.save(tx);
      return { transaction: saved, newBalance: energy.balance };
    });
  }
}
