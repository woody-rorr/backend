import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 2.0 로그인 시작 (passport redirect)' })
  @ApiResponse({ status: 302, description: 'Google 인증 페이지로 redirect' })
  async googleAuth(): Promise<void> {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth 콜백. 신규/기존 사용자 처리 후 JWT 발급' })
  @ApiResponse({ status: 200, description: '{ access_token, refresh_token }' })
  @ApiResponse({ status: 401, description: 'OAUTH_FAILED' })
  async googleCallback(@Req() req: Request): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.issueTokens(req.user as any);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'refresh token 으로 access token 재발급' })
  @ApiResponse({ status: 200, description: '{ access_token }' })
  @ApiResponse({ status: 401, description: 'TOKEN_EXPIRED' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ access_token: string }> {
    return this.authService.refreshAccessToken(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: '로그아웃 (stateless — 클라이언트가 토큰 폐기)' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async logout(): Promise<void> {
    return;
  }
}
