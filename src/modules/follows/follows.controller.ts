import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto } from './dto/follow-response.dto';
import { FollowStatusResponseDto } from './dto/follow-status-response.dto';
import { FollowsService } from './follows.service';

type AuthedRequest = Request & { user: { sub: string } };

@ApiTags('follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiOperation({ summary: '팔로우 하기' })
  @ApiResponse({ status: 201, description: '팔로우 성공', type: FollowResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 409, description: '이미 팔로우 중' })
  @ApiResponse({ status: 422, description: '자기 자신은 팔로우할 수 없음' })
  create(
    @Req() req: AuthedRequest,
    @Body() dto: CreateFollowDto,
  ): Promise<FollowResponseDto> {
    return this.followsService.follow(req.user.sub, dto.followingId);
  }

  @Delete(':followingId')
  @HttpCode(204)
  @ApiOperation({ summary: '언팔로우' })
  @ApiParam({ name: 'followingId', format: 'uuid', description: '언팔로우할 사용자 ID' })
  @ApiResponse({ status: 204, description: '언팔로우 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '팔로우 관계 없음' })
  remove(
    @Req() req: AuthedRequest,
    @Param('followingId', new ParseUUIDPipe()) followingId: string,
  ): Promise<void> {
    return this.followsService.unfollow(req.user.sub, followingId);
  }

  @Get('followers')
  @ApiOperation({ summary: '내 팔로워 목록 조회' })
  @ApiResponse({ status: 200, description: '팔로워 목록', type: [FollowResponseDto] })
  @ApiResponse({ status: 401, description: '인증 필요' })
  getFollowers(@Req() req: AuthedRequest): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowers(req.user.sub);
  }

  @Get('following')
  @ApiOperation({ summary: '내가 팔로우하는 사람 목록 조회' })
  @ApiResponse({ status: 200, description: '팔로잉 목록', type: [FollowResponseDto] })
  @ApiResponse({ status: 401, description: '인증 필요' })
  getFollowing(@Req() req: AuthedRequest): Promise<FollowResponseDto[]> {
    return this.followsService.getFollowing(req.user.sub);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: '특정 사용자와의 팔로우 관계 확인' })
  @ApiParam({ name: 'userId', format: 'uuid', description: '관계를 확인할 사용자 ID' })
  @ApiResponse({ status: 200, description: '팔로우 관계', type: FollowStatusResponseDto })
  @ApiResponse({ status: 401, description: '인증 필요' })
  getStatus(
    @Req() req: AuthedRequest,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<FollowStatusResponseDto> {
    return this.followsService.getStatus(req.user.sub, userId);
  }
}
