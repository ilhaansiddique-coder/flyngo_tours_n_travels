import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '../../config/config.service';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    // Single-tenant deployments are pinned to the default tenant — a caller
    // cannot scope to another tenant by sending an X-Tenant-Id header. In
    // multi-tenant mode the header selects the public tenant context; requests
    // from signed-in users are re-bound to their own tenant by TenantGuard.
    const tenantId = this.configService.isMultiTenant
      ? (req.headers['x-tenant-id'] as string) || DEFAULT_TENANT_ID
      : DEFAULT_TENANT_ID;

    (req as any).tenantId = tenantId;

    next();
  }
}
