import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CalendarRepository } from './calendar.repository';
import { CalendarEntity } from './entities/calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarResponseDto } from './dto/calendar-response.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  async create(
    userId: string,
    dto: CreateCalendarDto,
  ): Promise<CalendarResponseDto> {
    const calendar = await this.calendarRepository.create({
      userId,
      title: dto.title,
      description: dto.description ?? null,
      color: dto.color ?? null,
      isDefault: dto.isDefault ?? false,
    });
    return CalendarResponseDto.fromEntity(calendar);
  }

  async findAll(
    userId: string,
  ): Promise<{ data: CalendarResponseDto[]; meta: { total: number } }> {
    const items = await this.calendarRepository.findByUser(userId);
    return {
      data: items.map((c) => CalendarResponseDto.fromEntity(c)),
      meta: { total: items.length },
    };
  }

  async findOne(userId: string, id: string): Promise<CalendarResponseDto> {
    const calendar = await this.getOwned(userId, id);
    return CalendarResponseDto.fromEntity(calendar);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCalendarDto,
  ): Promise<CalendarResponseDto> {
    await this.getOwned(userId, id);

    const patch: Partial<CalendarEntity> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.color !== undefined) patch.color = dto.color;
    if (dto.isDefault !== undefined) patch.isDefault = dto.isDefault;

    const updated = await this.calendarRepository.update(id, patch);
    return CalendarResponseDto.fromEntity(updated as CalendarEntity);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwned(userId, id);
    await this.calendarRepository.delete(id);
  }

  private async getOwned(userId: string, id: string): Promise<CalendarEntity> {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }
    if (calendar.userId !== userId) {
      throw new ForbiddenException('You do not have access to this calendar');
    }
    return calendar;
  }
}
