import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
