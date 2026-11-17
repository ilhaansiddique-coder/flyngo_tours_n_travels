/**
 * Facebook login is temporarily hidden while the Meta app review
 * (email permission) is pending. Flip to true once the app is Live.
 */
export const FACEBOOK_LOGIN_ENABLED = false;

export function getOAuthUrl(provider: 'google' | 'facebook'): string {
  return `/api/v1/auth/${provider}`;
}
