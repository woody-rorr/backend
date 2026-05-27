import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload { sub: string; email: string; roles: string[]; iat?: number; exp?: number; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('jwt.secret');
    if (!secret) throw new Error('jwt.secret is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  validate(payload: JwtPayload): Pick<JwtPayload, 'sub' | 'email' | 'roles'> {
    if (!payload?.sub) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid token' });
    return { sub: payload.sub, email: payload.email, roles: payload.roles ?? [] };
  }
}
