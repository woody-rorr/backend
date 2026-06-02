import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryEventsDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'startTime:asc', description: '<field>:<asc|desc>' })
  @IsOptional()
  @IsString()
  sort?: string = 'startTime:asc';

  @ApiPropertyOptional({ description: 'range filter start (ISO 8601). GET /events 전용' })
  @IsOptional()
  @IsISO8601()
  start?: string;

  @ApiPropertyOptional({ description: 'range filter end (ISO 8601). GET /events 전용' })
  @IsOptional()
  @IsISO8601()
  end?: string;
}
