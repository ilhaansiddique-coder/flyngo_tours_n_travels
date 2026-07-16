import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const tenantId =
      req.headers['x-tenant-id'] as string ||
      (req as any).user?.tenantId;

    if (tenantId) {
      (req as any).tenantId = tenantId;
    }

    next();
  }
}
