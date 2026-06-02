import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEntity } from './entities/calendar.entity';

@Injectable()
export class CalendarRepository {
  constructor(
    @InjectRepository(CalendarEntity)
    private readonly repo: Repository<CalendarEntity>,
  ) {}

  create(data: Partial<CalendarEntity>): Promise<CalendarEntity> {
    return this.repo.save(this.repo.create(data));
  }

  findByUser(userId: string): Promise<CalendarEntity[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string): Promise<CalendarEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(
    id: string,
    patch: Partial<CalendarEntity>,
  ): Promise<CalendarEntity | null> {
    await this.repo.update(id, patch);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
