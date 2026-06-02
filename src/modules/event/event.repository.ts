import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsOrder, Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  create(data: Partial<EventEntity>): EventEntity {
    return this.repo.create(data);
  }

  save(event: EventEntity): Promise<EventEntity> {
    return this.repo.save(event);
  }

  findById(id: string): Promise<EventEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByCalendar(
    calendarId: string,
    order: FindOptionsOrder<EventEntity>,
    skip: number,
    take: number,
  ): Promise<[EventEntity[], number]> {
    return this.repo.findAndCount({ where: { calendarId }, order, skip, take });
  }

  findInRange(
    start: Date,
    end: Date,
    order: FindOptionsOrder<EventEntity>,
    skip: number,
    take: number,
  ): Promise<[EventEntity[], number]> {
    return this.repo.findAndCount({
      where: { startTime: Between(start, end) },
      order,
      skip,
      take,
    });
  }

  async remove(event: EventEntity): Promise<void> {
    await this.repo.remove(event);
  }
}
