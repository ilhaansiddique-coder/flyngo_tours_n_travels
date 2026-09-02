import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { OAuthFailureReason, OAuthRedirectException, resolveOAuthFailureReason } from '../oauth-redirect.exception';

/**
 * Passport guards that never leak raw 401 JSON. Any failure during the
 * OAuth handshake (user closed the consent screen, denied permissions,
 * provider not configured, ...) is converted into an OAuthRedirectException,
 * which the OAuthRedirectFilter turns into a friendly redirect.
 */
function createOAuthGuard(strategyName: 'google' | 'facebook'): Type<IAuthGuard> {
  @Injectable()
  class OAuthPassportGuard extends AuthGuard(strategyName) {
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
