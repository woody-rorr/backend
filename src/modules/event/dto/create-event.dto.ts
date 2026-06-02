import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-06-02T10:00:00Z', description: 'ISO 8601 (UTC)' })
  @IsISO8601()
  startTime: string;

  @ApiProperty({ example: '2026-06-02T11:00:00Z', description: 'ISO 8601 (UTC)' })
  @IsISO8601()
  endTime: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}
