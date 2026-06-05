import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MemberService } from '../member/member.service';
import { Member } from '../member/entities/member.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issueTokens(member: Member): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = { sub: member.id, email: member.email, roles: ['user'] };
    const secret = this.config.get<string>('JWT_SECRET');
    const access_token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h',
    });
    const refresh_token = await this.jwtService.signAsync(
      { sub: member.id },
      { secret, expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d' },
    );
    return { access_token, refresh_token };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    const secret = this.config.get<string>('JWT_SECRET');
    let decoded: { sub: string };
    try {
      decoded = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException({
        code: 'TOKEN_EXPIRED',
        message: '리프레시 토큰이 만료되었거나 유효하지 않습니다',
      });
    }
    const member = await this.memberService.findById(decoded.sub);
    if (!member) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' });
    }
    const payload: JwtPayload = { sub: member.id, email: member.email, roles: ['user'] };
    const access_token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h',
    });
    return { access_token };
  }
}
