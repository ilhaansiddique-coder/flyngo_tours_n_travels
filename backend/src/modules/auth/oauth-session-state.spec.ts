import { GoogleOAuthGuard, FacebookOAuthGuard } from './guards/oauth.guards';
import { OAuthRedirectException } from './oauth-redirect.exception';

describe('OAuth browser state binding', () => {
  const config = { isProduction: true };
  function setup(provider = 'google') {
    const req: any = { path: '/api/v1/auth/' + provider, cookies: {}, query: {} };
    const res = { cookie: jest.fn(), clearCookie: jest.fn() };
    const context: any = { switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }) };
    const Guard = provider === 'google' ? GoogleOAuthGuard : FacebookOAuthGuard;
    const guard: any = new (Guard as any)(config);
    return { req, res, context, guard };
  }
  it('uses a random HttpOnly, Secure, host-scoped state cookie', () => {
    const { context, guard, res } = setup();
    const result = guard.getAuthenticateOptions(context);
    expect(result.state).toMatch(/^[a-f0-9]{64}$/);
    expect(res.cookie).toHaveBeenCalledWith('__Host-flyngo-refresh-google-state', result.state,
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600000 }));
  });
  it('accepts a matching callback and clears its one-time browser state', () => {
    const { context, guard, res, req } = setup();
    const { state } = guard.getAuthenticateOptions(context);
    req.path += '/callback'; req.cookies['__Host-flyngo-refresh-google-state'] = state; req.query.state = state;
    expect(guard.getAuthenticateOptions(context)).toEqual({ session: false });
    expect(res.clearCookie).toHaveBeenCalledWith('__Host-flyngo-refresh-google-state', expect.objectContaining({ secure: true, path: '/' }));
  });
  it.each([undefined, 'wrong', 'a'.repeat(64), 'é'.repeat(64)])('rejects missing or mismatching callback state: %s', (actual) => {
    const { context, guard, req } = setup();
    req.path += '/callback'; req.cookies['__Host-flyngo-refresh-google-state'] = 'b'.repeat(64); req.query.state = actual;
    expect(() => guard.getAuthenticateOptions(context)).toThrow(OAuthRedirectException);
  });
  it('does not accept another provider’s state cookie', () => {
    const { context, guard, req } = setup('facebook');
    req.path += '/callback'; req.cookies['__Host-flyngo-refresh-google-state'] = 'b'.repeat(64); req.query.state = 'b'.repeat(64);
    expect(() => guard.getAuthenticateOptions(context)).toThrow(OAuthRedirectException);
  });
});
