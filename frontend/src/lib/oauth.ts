export function getOAuthUrl(provider: 'google' | 'facebook'): string {
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. OAuth flows require the public backend URL.',
    );
  }
  return `${base.replace(/\/$/, '')}/api/v1/auth/${provider}`;
}
