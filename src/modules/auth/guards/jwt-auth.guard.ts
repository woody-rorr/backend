import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException({ code: 'TOKEN_EXPIRED', message: '세션이 만료되었습니다' });
      }
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '인증이 필요합니다' });
    }
    return user as TUser;
  }
}
