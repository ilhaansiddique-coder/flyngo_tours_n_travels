import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';

export interface SessionTokens {
  accessToken: string;
  /** Internal only: the controller writes this to HttpOnly cookies and strips it from JSON. */
  refreshToken: string;
  expiresIn: number;
  refreshExpiresAt: Date;
}
export const sessionTokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function durationSeconds(value: string | number, fallback: number): number {
  const match = String(value).trim().match(/^(\d+)(s|m|h|d|w)?$/);
  if (!match) return fallback;
  const result = Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400, w: 604800 }[match[2] || 's'] || 1);
  return Number.isSafeInteger(result) && result > 0 ? result : fallback;
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  private async tokens(session: { id: string; userId: string; tenantId: string; expiresAt: Date }, refreshToken: string): Promise<SessionTokens> {
    const expiresIn = Math.min(900, durationSeconds(this.config.get('JWT_ACCESS_EXPIRY', '15m'), 900));
    const accessToken = await this.jwt.signAsync({ sub: session.userId, tenantId: session.tenantId, sid: session.id }, {
      secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn,
    });
    return { accessToken, refreshToken, expiresIn, refreshExpiresAt: session.expiresAt };
  }

  async create(userId: string, tenantId: string, expectedPasswordHash?: string): Promise<SessionTokens> {
    const refreshToken = randomBytes(32).toString('hex');
    const ttl = Math.min(30 * 86400, durationSeconds(this.config.get('JWT_REFRESH_EXPIRY', '24h'), 86400));
    const session = await this.prisma.$transaction(async (tx) => {
      // Serialize issuance with password changes/deactivation/account deletion.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} AND tenant_id = ${tenantId} FOR UPDATE`;
      const user = await tx.user.findFirst({ where: { id: userId, tenantId, deletedAt: null, isActive: true,
        ...(expectedPasswordHash !== undefined ? { passwordHash: expectedPasswordHash } : {}),
      }, select: { id: true } });
      if (!user) throw new UnauthorizedException('User account is unavailable');
      return tx.authSession.create({ data: {
        userId, tenantId, expiresAt: new Date(Date.now() + ttl * 1000),
        refreshTokens: { create: { tokenHash: sessionTokenHash(refreshToken) } },
      } });
    });
    return this.tokens(session, refreshToken);
  }

  async rotate(refreshToken: string, tenantId: string): Promise<SessionTokens> {
    if (typeof refreshToken !== 'string' || !/^[a-f0-9]{64}$/.test(refreshToken)) throw new UnauthorizedException('Invalid session');
    const hash = sessionTokenHash(refreshToken);
    const nextToken = randomBytes(32).toString('hex');
    const session = await this.prisma.$transaction(async (tx) => {
      const initial = await tx.sessionRefreshToken.findUnique({ where: { tokenHash: hash }, select: { sessionId: true } });
      if (!initial) return null;
      // Serialize refresh/replay/logout for this session; re-read after acquiring the lock.
      await tx.$queryRaw`SELECT id FROM auth_sessions WHERE id = ${initial.sessionId} FOR UPDATE`;
      const token = await tx.sessionRefreshToken.findUnique({ where: { tokenHash: hash }, include: { session: { include: { user: true } } } });
      if (!token || token.session.tenantId !== tenantId) return null;
      const current = token.session;
      if (current.revokedAt || current.expiresAt <= new Date() || !current.user.isActive || current.user.deletedAt) return null;
      if (token.usedAt) {
        // Commit revocation, then reject outside the transaction so it cannot roll back.
        await tx.authSession.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
        return null;
      }
      await tx.sessionRefreshToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
      await tx.sessionRefreshToken.create({ data: { sessionId: current.id, tokenHash: sessionTokenHash(nextToken) } });
      return current;
    });
    if (!session) throw new UnauthorizedException('Invalid session');
    return this.tokens(session, nextToken);
  }

  async revokeCookie(token: string | undefined) {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return;
    const stored = await this.prisma.sessionRefreshToken.findUnique({ where: { tokenHash: sessionTokenHash(token) }, select: { sessionId: true } });
    if (stored) await this.prisma.authSession.updateMany({ where: { id: stored.sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async revokeAll(userId: string, tenantId: string) {
    await this.prisma.authSession.updateMany({ where: { userId, tenantId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async revokeAccessToken(token: string | undefined) {
    if (!token) return;
    let payload: { sub?: string; tenantId?: string; sid?: string; scope?: string };
    try { payload = await this.jwt.verifyAsync(token, { secret: this.config.get('JWT_ACCESS_SECRET') }); }
    catch { return; }
    if (payload.scope || typeof payload.sid !== 'string' || typeof payload.sub !== 'string' || typeof payload.tenantId !== 'string') return;
    await this.prisma.authSession.updateMany({ where: { id: payload.sid, userId: payload.sub, tenantId: payload.tenantId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
