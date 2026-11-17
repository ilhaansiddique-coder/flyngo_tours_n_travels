import { ForbiddenException } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '../../config/config.service';
import { SessionTokens } from './session.service';

export const refreshCookieName = (config: ConfigService) => config.isProduction ? '__Host-flyngo-refresh' : 'flyngo-refresh';
export const sessionCookieOptions = (config: ConfigService): CookieOptions => ({ httpOnly: true, secure: config.isProduction, sameSite: 'lax', path: '/' });
export function assertSessionOrigin(req: Request, config: ConfigService) {
  const allowed = [config.get('FRONTEND_URL', ''), config.get('ADMIN_URL', '')].filter(Boolean).map((url) => new URL(url).origin);
  if (req.get('X-Requested-With') !== 'Flyngo' || !allowed.includes(req.get('Origin') || '')) throw new ForbiddenException('Untrusted session request');
}
export function clearSessionCookies(res: Response, config: ConfigService) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.clearCookie(refreshCookieName(config), sessionCookieOptions(config));
  res.clearCookie('flyngo-auth', { path: '/' });
}
export function deliverSession(res: Response, config: ConfigService, tokens: SessionTokens) {
  res.cookie(refreshCookieName(config), tokens.refreshToken, { ...sessionCookieOptions(config), expires: tokens.refreshExpiresAt });
  res.clearCookie('flyngo-auth', { path: '/' });
  res.setHeader('Cache-Control', 'private, no-store');
  return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
}
