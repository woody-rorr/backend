import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowCheckResponseDto } from './dto/follow-check-response.dto';
import { FollowService } from './follow.service';

interface AuthenticatedRequest {
  user: { id: string; sub?: string };
}

@ApiTags('follows')
@ApiBearerAuth()
@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '팔로우 생성' })
  @ApiResponse({ status: 201, type: FollowResponseDto })
  @ApiResponse({ status: 400, description: '자기 자신 팔로우 불가' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 409, description: '이미 팔로우 중' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFollowDto,
  ): Promise<FollowResponseDto> {
    return this.followService.create(this.userId(req), dto.followingId);
  }

  @Delete(':followingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '팔로우 취소' })
  @ApiParam({ name: 'followingId', type: String, format: 'uuid' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '팔로우 관계 없음' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('followingId', new ParseUUIDPipe()) followingId: string,
  ): Promise<void> {
    await this.followService.remove(this.userId(req), followingId);
  }

  @Get('followers')
  @ApiOperation({ summary: '나를 팔로우하는 사람 목록' })
  @ApiResponse({ status: 200, type: [FollowResponseDto] })
  listFollowers(@Req() req: AuthenticatedRequest): Promise<FollowResponseDto[]> {
    return this.followService.listFollowers(this.userId(req));
  }

  @Get('followings')
  @ApiOperation({ summary: '내가 팔로우하는 사람 목록' })
  @ApiResponse({ status: 200, type: [FollowResponseDto] })
  listFollowings(@Req() req: AuthenticatedRequest): Promise<FollowResponseDto[]> {
    return this.followService.listFollowings(this.userId(req));
  }

  @Get('check/:userId')
  @ApiOperation({ summary: '특정 사용자 팔로우 여부 확인' })
  @ApiParam({ name: 'userId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: FollowCheckResponseDto })
  check(
    @Req() req: AuthenticatedRequest,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<FollowCheckResponseDto> {
    return this.followService.check(this.userId(req), userId);
  }

  private userId(req: AuthenticatedRequest): string {
    return req.user?.id ?? req.user?.sub ?? '';
  }
}
