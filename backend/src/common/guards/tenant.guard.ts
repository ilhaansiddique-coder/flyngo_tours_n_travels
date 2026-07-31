import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.configService.isMultiTenant) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    request['tenantId'] = tenantId;
    return true;
  }
}
