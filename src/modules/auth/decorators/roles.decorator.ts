import { SetMetadata } from '@nestjs/common';

/**
 * Roles 메타데이터 키. RolesGuard가 이 키로 핸들러/클래스의 허용 role을 읽는다.
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles('admin', 'manager') 형태로 controller 또는 메서드에 부착.
 * 06-runtime-rules.md §3 — 인가는 role 단위까지만 guard가 판단.
 */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
