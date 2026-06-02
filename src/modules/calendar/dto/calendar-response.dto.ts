import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from '../entities/calendar.entity';

export class CalendarResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  color: string | null;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt: string;

  static fromEntity(entity: CalendarEntity): CalendarResponseDto {
    const dto = new CalendarResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.color = entity.color;
    dto.isDefault = entity.isDefault;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
