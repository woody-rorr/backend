import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — @Roles() 로 명시된 role을 요청자(JwtPayload.roles)가 보유하는지 검사.
 *
 * - JwtAuthGuard가 먼저 동작해 req.user(JwtPayload)를 채운 뒤 실행되는 것을 전제로 한다.
 *   (본 guard는 JWT 인증 로직을 건드리지 않는다.)
 * - 06-runtime-rules.md §3 — 리소스 소유권 체크는 service 레이어 책임, guard는 role 단위까지만.
 * - 권한 부족 → 403. 전역 ExceptionFilter가 ForbiddenException을 { code: 'FORBIDDEN' } 으로 변환.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // @Roles() 미지정 → role 제약 없음 (인증 통과만으로 접근 허용).
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { roles?: string[] } | undefined;

    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '권한이 없습니다' });
    }

    const hasRole = requiredRoles.some((role) => user.roles!.includes(role));
    if (!hasRole) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '권한이 없습니다' });
    }

    return true;
  }
}
