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
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarResponseDto } from './dto/calendar-response.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('calendars')
@ApiBearerAuth()
@Controller('calendars')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '캘린더 생성' })
  @ApiResponse({ status: 201, type: CalendarResponseDto })
  @ApiResponse({ status: 400, description: 'validation 실패' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCalendarDto,
  ): Promise<CalendarResponseDto> {
    return this.calendarService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 캘린더 목록' })
  @ApiResponse({ status: 200, type: [CalendarResponseDto] })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.calendarService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: '캘린더 상세' })
  @ApiResponse({ status: 200, type: CalendarResponseDto })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '리소스 없음' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CalendarResponseDto> {
    return this.calendarService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '캘린더 수정' })
  @ApiResponse({ status: 200, type: CalendarResponseDto })
  @ApiResponse({ status: 400, description: 'validation 실패' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '리소스 없음' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarDto,
  ): Promise<CalendarResponseDto> {
    return this.calendarService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '캘린더 삭제' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 누락/실패' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '리소스 없음' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.calendarService.remove(req.user.sub, id);
  }
}
