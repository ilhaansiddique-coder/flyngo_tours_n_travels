import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    let payload: { sub: string; tenantId: string; scope?: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      this.logger.warn(`JWT verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid access token');
    }

    // Scoped tokens are single-purpose. `password_change` is issued at first
    // login to someone still holding a staff-issued temporary password; it must
    // reach the change-password endpoint and nothing else, or the forced change
    // is just a screen you can navigate away from.
    if (payload.scope) {
      throw new UnauthorizedException('This token cannot be used for this request');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`User not found for token sub: ${payload.sub}`);
      throw new UnauthorizedException('User account not found');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const permissions = user.role.permissions.map(
      (rp) => rp.permission.code,
    );

    request['user'] = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleCode: user.role.code,
      tenantId: user.tenantId,
      permissions,
    };

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
