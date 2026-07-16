import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || request.user?.tenantId || null;
  },
);
