import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { OAuthFailureReason, OAuthRedirectException, resolveOAuthFailureReason } from '../oauth-redirect.exception';
import { ConfigService } from '../../../config/config.service';
import { randomBytes, timingSafeEqual } from 'crypto';
import { refreshCookieName, sessionCookieOptions } from '../session-http';

/**
 * Passport guards that never leak raw 401 JSON. Any failure during the
 * OAuth handshake (user closed the consent screen, denied permissions,
 * provider not configured, ...) is converted into an OAuthRedirectException,
 * which the OAuthRedirectFilter turns into a friendly redirect.
 */
function createOAuthGuard(strategyName: 'google' | 'facebook'): Type<IAuthGuard> {
  @Injectable()
  class OAuthPassportGuard extends AuthGuard(strategyName) {
    constructor(private readonly config: ConfigService) { super(); }

    getAuthenticateOptions(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      const name = refreshCookieName(this.config) + '-' + strategyName + '-state';
      if (req.path.endsWith('/callback')) {
        const expected = req.cookies?.[name];
        const actual = req.query.state;
        res.clearCookie(name, sessionCookieOptions(this.config));
        if (typeof expected !== 'string' || typeof actual !== 'string' || !/^[a-f0-9]{64}$/.test(expected) || !/^[a-f0-9]{64}$/.test(actual) ||
          !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))) throw new OAuthRedirectException('oauth_failed');
        return { session: false };
      }
      const state = randomBytes(32).toString('hex');
      res.cookie(name, state, { ...sessionCookieOptions(this.config), maxAge: 10 * 60_000 });
      return { session: false, state };
    }

    handleRequest<TUser = any>(
      err: any,
      user: any,
      info: any,
      _context: ExecutionContext,
      _status?: number,
    ): TUser {
      if (err || !user) {
        // Passport delivers consent-screen denials via `info` (strategy .fail()),
        // hard errors via `err`. Inspect both to classify the reason.
        throw new OAuthRedirectException(resolveOAuthFailureReason(err ?? info));
      }
      return user as TUser;
    }
  }
  Object.defineProperty(OAuthPassportGuard, 'name', { value: `${strategyName}OAuthGuard` });
  return OAuthPassportGuard;
}

export const GoogleOAuthGuard: Type<IAuthGuard> = createOAuthGuard('google');
export const FacebookOAuthGuard: Type<IAuthGuard> = createOAuthGuard('facebook');

export type { OAuthFailureReason };
