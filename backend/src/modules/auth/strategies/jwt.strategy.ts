import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../../config/config.service';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; tenantId: string; sid?: string; scope?: string }) {
    if (payload.scope) throw new UnauthorizedException('This token cannot be used for this request');
    if (!payload.sid || !await this.prisma.authSession.findFirst({ where: {
      id: payload.sid, userId: payload.sub, tenantId: payload.tenantId, revokedAt: null, expiresAt: { gt: new Date() },
    }, select: { id: true } })) throw new UnauthorizedException('Session has ended');
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, tenantId: payload.tenantId, deletedAt: null, isActive: true },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('User account is unavailable');
    return { id: payload.sub, tenantId: payload.tenantId };
  }
}
