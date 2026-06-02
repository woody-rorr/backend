import { ApiProperty } from '@nestjs/swagger';
import { EventEntity } from '../entities/event.entity';

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  calendarId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty({ nullable: true })
  location: string | null;

  @ApiProperty()
  isAllDay: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromEntity(e: EventEntity): EventResponseDto {
    const dto = new EventResponseDto();
    dto.id = e.id;
    dto.calendarId = e.calendarId;
    dto.title = e.title;
    dto.description = e.description;
    dto.startTime = e.startTime.toISOString();
    dto.endTime = e.endTime.toISOString();
    dto.location = e.location;
    dto.isAllDay = e.isAllDay;
    dto.createdAt = e.createdAt.toISOString();
    dto.updatedAt = e.updatedAt.toISOString();
    return dto;
  }
}
