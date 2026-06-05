import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MemberService } from './member.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';

interface AuthedRequest {
  user: { sub: string; email?: string; roles: string[] };
}

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('me')
  @ApiOperation({ summary: '현재 로그인 사용자 정보 조회' })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 404, description: 'MEMBER_NOT_FOUND' })
  async getMe(@Req() req: AuthedRequest): Promise<MemberResponseDto> {
    const member = await this.memberService.findById(req.user.sub);
    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: '회원을 찾을 수 없습니다',
      });
    }
    return MemberResponseDto.fromEntity(member);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  @ApiResponse({ status: 400, description: 'VALIDATION_ERROR' })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 404, description: 'MEMBER_NOT_FOUND' })
  async updateMe(
    @Req() req: AuthedRequest,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const member = await this.memberService.update(req.user.sub, dto);
    return MemberResponseDto.fromEntity(member);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: '계정 탈퇴 (soft delete)' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 401, description: 'UNAUTHORIZED' })
  @ApiResponse({ status: 404, description: 'MEMBER_NOT_FOUND' })
  async deleteMe(@Req() req: AuthedRequest): Promise<void> {
    await this.memberService.softDelete(req.user.sub);
  }
}
