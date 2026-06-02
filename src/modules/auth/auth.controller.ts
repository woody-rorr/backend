import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthTokenResponseDto, UserResponseDto } from './dto/user-response.dto';
import { GoogleProfile } from './strategies/google.strategy';
import { JwtPayload } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Post('google')
  @ApiOperation({ summary: 'Google OAuth 로그인 시작 (Google로 리다이렉트)' })
  @ApiResponse({ status: 302, description: 'Google 인증 페이지로 리다이렉트' })
  async googleAuth(): Promise<void> {}

  @Public()
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth 콜백 — 계정 자동 생성 후 JWT 발급' })
  @ApiResponse({ status: 200, type: AuthTokenResponseDto })
  async googleCallback(@Req() req: Request): Promise<AuthTokenResponseDto> {
    const profile = req.user as GoogleProfile;
    const { accessToken, user } = await this.authService.loginWithGoogle(profile);
    return AuthTokenResponseDto.from(accessToken, user);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '현재 클라이언트 세션 해제 (클라이언트 측 토큰 폐기)' })
  @ApiResponse({ status: 200 })
  async logout(): Promise<{ success: boolean }> {
    return { success: true };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: '현재 로그인 사용자 정보 조회' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async me(@Req() req: Request): Promise<UserResponseDto> {
    const payload = req.user as JwtPayload;
    const user = await this.authService.getById(payload.sub);
    return UserResponseDto.from(user);
  }
}
