import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userTenant: string | undefined = request.user?.tenantId;
    const headerTenant: string | undefined = request.headers['x-tenant-id'];

    if (this.configService.isMultiTenant) {
      if (userTenant) {
        // Authenticated requests are ALWAYS bound to the user's own tenant.
        // The X-Tenant-Id header is ignored so a user can never read or write
        // another tenant's data by passing someone else's id.
        request['tenantId'] = userTenant;
        return true;
      }
      if (!headerTenant) {
        throw new ForbiddenException('Tenant context required');
      }
      request['tenantId'] = headerTenant;
      return true;
    }

    // Single-tenant deployment: pin every request to the default tenant so a
    // caller-supplied X-Tenant-Id header cannot scope to an unexpected row.
    request['tenantId'] = '00000000-0000-0000-0000-000000000001';
    return true;
  }
}
