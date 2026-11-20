import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { STAFF_PERMISSIONS_KEY } from '../decorators/staff-permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Access denied');

    const hasRole = requiredRoles.some((role) => user.roleCode === role);
    const permissionAlternatives = this.reflector.getAllAndOverride<string[]>(STAFF_PERMISSIONS_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    const hasStaffPermission = typeof user.roleCode === 'string' && user.roleCode.length > 0 &&
      user.roleCode !== 'customer' && permissionAlternatives?.some((permission) =>
        user.permissions?.includes(permission),
      );
    if (!hasRole && !hasStaffPermission) throw new ForbiddenException('Insufficient role or permission');

    return true;
  }
}
