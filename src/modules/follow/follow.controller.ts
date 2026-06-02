import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseEnumPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowTargetType } from './entities/follow.entity';
import { FollowService } from './follow.service';

interface AuthedRequest { user: { sub: string; email?: string; roles: string[] }; }

@ApiTags('follow')
@ApiBearerAuth()
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  @ApiOperation({ summary: 'follow 추가 (타입별 한도 초과 시 400)' })
  @ApiCreatedResponse({ type: FollowResponseDto })
  create(@Req() req: AuthedRequest, @Body() dto: CreateFollowDto): Promise<FollowResponseDto> {
    return this.followService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: '사용자의 follow 목록 전체 조회' })
  @ApiOkResponse({ type: FollowResponseDto, isArray: true })
  async findAll(@Req() req: AuthedRequest): Promise<{ data: FollowResponseDto[] }> {
    const data = await this.followService.findAll(req.user.sub);
    return { data };
  }

  @Get(':targetType')
  @ApiOperation({ summary: '특정 타입 follow 목록 조회' })
  @ApiParam({ name: 'targetType', enum: FollowTargetType })
  @ApiOkResponse({ type: FollowResponseDto, isArray: true })
  async findByType(@Req() req: AuthedRequest, @Param('targetType', new ParseEnumPipe(FollowTargetType)) targetType: FollowTargetType): Promise<{ data: FollowResponseDto[] }> {
    const data = await this.followService.findByType(req.user.sub, targetType);
    return { data };
  }

  @Delete(':targetType/:targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'unfollow' })
  @ApiParam({ name: 'targetType', enum: FollowTargetType })
  @ApiParam({ name: 'targetId' })
  @ApiNoContentResponse()
  remove(@Req() req: AuthedRequest, @Param('targetType', new ParseEnumPipe(FollowTargetType)) targetType: FollowTargetType, @Param('targetId') targetId: string): Promise<void> {
    return this.followService.remove(req.user.sub, targetType, targetId);
  }
}
