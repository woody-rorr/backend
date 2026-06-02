import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEventDto, UpdateEventDto } from './dto/create-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventService } from './event.service';

@ApiTags('events')
@ApiBearerAuth()
@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('calendars/:calendarId/events')
  @HttpCode(201)
  @ApiOperation({ summary: '캘린더에 이벤트 생성' })
  @ApiResponse({ status: 201, type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'CALENDAR_NOT_FOUND' })
  create(
    @Param('calendarId', ParseUUIDPipe) calendarId: string,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventService.create(calendarId, dto);
  }

  @Get('calendars/:calendarId/events')
  @ApiOperation({ summary: '캘린더의 이벤트 목록 (페이지네이션)' })
  @ApiResponse({ status: 200, type: [EventResponseDto] })
  listByCalendar(
    @Param('calendarId', ParseUUIDPipe) calendarId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.eventService.findByCalendar(calendarId, query);
  }

  @Get('events')
  @ApiOperation({ summary: '기간별 이벤트 조회 (start/end 필수)' })
  @ApiResponse({ status: 200, type: [EventResponseDto] })
  listByRange(@Query() query: QueryEventsDto) {
    return this.eventService.findInRange(query);
  }

  @Get('events/:id')
  @ApiOperation({ summary: '이벤트 상세' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'EVENT_NOT_FOUND' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EventResponseDto> {
    return this.eventService.findOne(id);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: '이벤트 수정' })
  @ApiResponse({ status: 200, type: EventResponseDto })
  @ApiResponse({ status: 404, description: 'EVENT_NOT_FOUND' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventService.update(id, dto);
  }

  @Delete('events/:id')
  @HttpCode(204)
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404, description: 'EVENT_NOT_FOUND' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eventService.remove(id);
  }
}
