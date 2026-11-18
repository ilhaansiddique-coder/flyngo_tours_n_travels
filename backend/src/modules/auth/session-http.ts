import { ForbiddenException } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ConfigService } from '../../config/config.service';
import { SessionTokens } from './session.service';

export const refreshCookieName = (config: ConfigService) => config.isProduction ? '__Host-flyngo-refresh' : 'flyngo-refresh';
export const sessionCookieOptions = (config: ConfigService): CookieOptions => ({ httpOnly: true, secure: config.isProduction, sameSite: 'lax', path: '/' });
export function sessionOrigins(config: ConfigService): Set<string> {
  const configured = [config.get('FRONTEND_URL', ''), config.get('ADMIN_URL', ''),
    ...config.get('SESSION_ALLOWED_ORIGINS', '').split(',')];
  const allowed = new Set<string>();
  for (const value of configured) {
    if (!value.trim()) continue;
    try {
      const url = new URL(value.trim());
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) continue;
      allowed.add(url.origin);
      // Both production hosts belong to this application. The public edge
      // redirects the apex to www, even when FRONTEND_URL uses the apex.
      // Do not infer trust for arbitrary sibling domains or subdomains.
      if (url.origin === 'https://flyngo.world' || url.origin === 'https://www.flyngo.world') {
        allowed.add('https://flyngo.world');
        allowed.add('https://www.flyngo.world');
      }
    } catch { /* Ignore malformed optional entries; never trust request Host headers. */ }
  }
  return allowed;
}
export function assertSessionOrigin(req: Request, config: ConfigService) {
  if (req.get('X-Requested-With') !== 'Flyngo' || !sessionOrigins(config).has(req.get('Origin') || '')) throw new ForbiddenException('Untrusted session request');
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
