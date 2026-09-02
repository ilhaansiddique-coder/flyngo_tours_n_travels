import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * Like JwtAuthGuard, but non-rejecting: if a valid Bearer token is present the
 * user is loaded onto `req.user` (so `userId`/`tenantId` are available and the
 * booking is linked to the account). If there is no token — or it is invalid —
 * the request is still allowed through as a guest (`req.user` stays undefined).
 *
 * This lets the public booking endpoint keep working for truly anonymous guests
 * while ensuring signed-in customers' bookings are attributed to their account
 * (and therefore show up in their own booking list).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalJwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // NOTE: intentionally does NOT early-return on @Public. This guard's whole
    // job is to attach req.user when a valid token is present (so a signed-in
    // customer's booking links to their account) while still allowing guests
    // through. It never rejects, so it's safe on a public route.
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) return true;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      // A scoped token (e.g. password_change) is not a session. Treat the caller
      // as a guest rather than attributing a booking to a half-claimed account.
      if (payload.scope) return true;
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      });
      if (!user || user.deletedAt) return true;
      request['user'] = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        roleCode: user.role?.code,
        tenantId: user.tenantId,
        permissions: user.role?.permissions?.map((rp) => rp.permission.code) ?? [],
      };
    } catch {
      // Invalid/expired token → treat as guest; do not reject the request.
    }
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
