import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FindOptionsOrder } from 'typeorm';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventEntity } from './entities/event.entity';
import { EventRepository } from './event.repository';

const SORTABLE_FIELDS = ['startTime', 'endTime', 'createdAt', 'title'] as const;

@Injectable()
export class EventService {
  constructor(private readonly eventRepo: EventRepository) {}

  async create(calendarId: string, dto: CreateEventDto): Promise<EventResponseDto> {
    this.assertTimeRange(dto.startTime, dto.endTime);
    const entity = this.eventRepo.create({
      calendarId,
      title: dto.title,
      description: dto.description ?? null,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      location: dto.location ?? null,
      isAllDay: dto.isAllDay ?? false,
    });
    try {
      const saved = await this.eventRepo.save(entity);
      return EventResponseDto.fromEntity(saved);
    } catch (err) {
      if (this.isForeignKeyViolation(err)) {
        throw new NotFoundException({
          code: 'CALENDAR_NOT_FOUND',
          message: '캘린더를 찾을 수 없습니다',
        });
      }
      throw err;
    }
  }

  async findByCalendar(calendarId: string, query: QueryEventsDto) {
    const { page, limit } = this.normalizePaging(query);
    const [rows, total] = await this.eventRepo.findByCalendar(
      calendarId,
      this.parseSort(query.sort),
      (page - 1) * limit,
      limit,
    );
    return this.paginate(rows, total, page, limit);
  }

  async findInRange(query: QueryEventsDto) {
    if (!query.start || !query.end) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'start와 end 쿼리 파라미터가 필요합니다',
      });
    }
    const start = new Date(query.start);
    const end = new Date(query.end);
    if (start.getTime() > end.getTime()) {
      throw new UnprocessableEntityException({
        code: 'INVALID_TIME_RANGE',
        message: 'start는 end보다 이후일 수 없습니다',
      });
    }
    const { page, limit } = this.normalizePaging(query);
    const [rows, total] = await this.eventRepo.findInRange(
      start,
      end,
      this.parseSort(query.sort),
      (page - 1) * limit,
      limit,
    );
    return this.paginate(rows, total, page, limit);
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.loadOrFail(id);
    return EventResponseDto.fromEntity(event);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
    const event = await this.loadOrFail(id);
    const nextStart = dto.startTime ? new Date(dto.startTime) : event.startTime;
    const nextEnd = dto.endTime ? new Date(dto.endTime) : event.endTime;
    if (dto.startTime !== undefined || dto.endTime !== undefined) {
      this.assertTimeRange(nextStart.toISOString(), nextEnd.toISOString());
    }
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.description !== undefined) event.description = dto.description ?? null;
    if (dto.startTime !== undefined) event.startTime = nextStart;
    if (dto.endTime !== undefined) event.endTime = nextEnd;
    if (dto.location !== undefined) event.location = dto.location ?? null;
    if (dto.isAllDay !== undefined) event.isAllDay = dto.isAllDay;
    const saved = await this.eventRepo.save(event);
    return EventResponseDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const event = await this.loadOrFail(id);
    await this.eventRepo.remove(event);
  }

  private async loadOrFail(id: string): Promise<EventEntity> {
    const event = await this.eventRepo.findById(id);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: '이벤트를 찾을 수 없습니다',
      });
    }
    return event;
  }

  private assertTimeRange(start: string, end: string): void {
    if (new Date(start).getTime() > new Date(end).getTime()) {
      throw new UnprocessableEntityException({
        code: 'INVALID_TIME_RANGE',
        message: 'endTime은 startTime보다 이전일 수 없습니다',
      });
    }
  }

  private normalizePaging(query: QueryEventsDto): { page: number; limit: number } {
    return { page: query.page ?? 1, limit: query.limit ?? 20 };
  }

  private paginate(rows: EventEntity[], total: number, page: number, limit: number) {
    return {
      data: rows.map((r) => EventResponseDto.fromEntity(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private parseSort(sort?: string): FindOptionsOrder<EventEntity> {
    const [fieldRaw, dirRaw] = (sort ?? 'startTime:asc').split(':');
    const field = (SORTABLE_FIELDS as readonly string[]).includes(fieldRaw)
      ? fieldRaw
      : 'startTime';
    const direction = dirRaw?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    return { [field]: direction } as FindOptionsOrder<EventEntity>;
  }

  private isForeignKeyViolation(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === '23503'
    );
  }
}
