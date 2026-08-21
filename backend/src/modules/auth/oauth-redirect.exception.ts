import { HttpException, HttpStatus } from '@nestjs/common';

export type OAuthFailureReason =
  | 'oauth_cancelled'
  | 'email_required'
  | 'oauth_failed';

/**
 * Thrown when an OAuth flow fails (user cancelled the consent screen,
 * denied permissions, provider misconfigured, ...).
 * The OAuthRedirectFilter converts this into a friendly browser
 * redirect back to the frontend instead of leaking raw JSON.
 */
export class OAuthRedirectException extends HttpException {
  constructor(public readonly reason: OAuthFailureReason) {
    super(
      { message: `OAuth sign-in failed: ${reason}`, statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export function resolveOAuthFailureReason(err: any): OAuthFailureReason {
  const message = String(err?.message ?? err ?? '').toLowerCase();

  if (message.includes('email')) {
    return 'email_required';
  }

  const cancelled =
    err?.name === 'AuthorizationError' ||
    ['access_denied', 'access_denied_custom', 'user_cancelled_login', 'user_denied'].includes(
      String(err?.code),
    ) ||
    message.includes('access_denied') ||
    message.includes('access denied') ||
    message.includes('cancelled');

  if (cancelled) {
    return 'oauth_cancelled';
  }

  return 'oauth_failed';
}
