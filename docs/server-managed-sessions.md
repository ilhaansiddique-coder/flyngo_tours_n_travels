# Server-managed browser sessions

## What changes

- Refresh credentials are random 256-bit opaque values in an HttpOnly cookie.
  Production uses `__Host-flyngo-refresh` with Secure, SameSite=Lax, Path=/ and no
  Domain attribute. Development uses `flyngo-refresh` without Secure for localhost.
- The browser no longer persists access tokens, refresh tokens or user profiles
  in JavaScript-readable cookies/localStorage. Access tokens live in memory.
  Old `flyngo-auth` storage is cleared. Page reloads restore the session and profile
  through a cookie-authenticated POST, before navigation guards make a decision.
- PostgreSQL stores session records and SHA-256 refresh-token hashes. A refresh
  token is consumed once, then replaced. Reusing a known consumed token revokes
  its entire session family and all of that family's access tokens. Unknown
  random tokens do not revoke other sessions.
- Every protected request checks the JWT's session ID against the database,
  including active account status, session expiry and revocation. Public optional
  authentication does not attach a revoked identity. Legacy JWTs without session
  IDs are rejected.
- Access JWTs last at most 15 minutes. `JWT_ACCESS_EXPIRY` can make them shorter;
  older configurations such as 24h are capped. `JWT_REFRESH_EXPIRY` defines the
  absolute session lifetime (24h default, capped at 30 days). Rotation does not
  extend the session indefinitely.
- Logout revokes the current server session before clearing browser state/cookies.
  It also accepts the current access credential for revocation if a browser has
  lost its refresh cookie.
  If the server cannot be reached, the UI reports failure instead of claiming that
  revocation succeeded. A dashboard button signs out all devices.
- Password reset, administrative password replacement, credential reissue and
  account deactivation revoke sessions. Reactivation does not restore revoked
  sessions. Account deletion cascades through session and refresh-token history.
  Session issuance locks the user record and rejects stale password proofs so
  concurrent password changes cannot mint a session from an old password.
- Browser Web Locks serialize rotation and login/logout between tabs. A fallback
  queue serializes them within one tab where Web Locks is unavailable. Cross-tab
  login/logout notifications contain no credentials, and cached account data is
  cleared when the identity changes. Replay detection remains strict; competing
  uncoordinated clients reusing one token must sign in again.

## Cookie request protections and OAuth

Session-changing POST requests require `X-Requested-With: Flyngo` and an Origin
exactly matching configured `FRONTEND_URL` or `ADMIN_URL`. Broad CORS settings do
not expand this trusted list. SameSite cookies add another layer. Refresh tokens
sent in JSON are ignored; the refresh endpoint reads only the HttpOnly cookie.
Session responses use no-store cache headers.

The frontend API client sends these headers and uses the same-origin `/api/v1`
proxy. OAuth starts on that same origin. Google/Facebook callback URLs are now
derived from `FRONTEND_URL`, so state and refresh cookies belong to the website
host. A random HttpOnly browser-state cookie binds each provider callback to the
browser that started it. OAuth redirects contain only a provider/error marker,
never access or refresh credentials.

This change does not replace the existing temporary-password onboarding policy.
HttpOnly cookies prevent JavaScript from reading refresh secrets; application XSS
prevention and private response access controls remain necessary.

## Deployment

1. Back up the database, then deploy backend and frontend together. The new
   migration creates `auth_sessions` and `session_refresh_tokens`. The standard
   backend entrypoint runs migrations before startup.
2. **All existing users must sign in once after rollout.** Stateless access and
   refresh credentials cannot be converted into revocable sessions. Old clients
   must reload the updated frontend.
3. Set `FRONTEND_URL` to the exact HTTPS origin users see, including `www` where
   applicable, for example `https://www.flyngo.world`. Set `ADMIN_URL` to the exact
   admin website origin. An apex/www mismatch will correctly reject session POSTs
   as untrusted; a redirect is not a substitute for the correct setting.
4. Register the matching provider redirect URIs in Google/Meta settings:
   `https://www.flyngo.world/api/v1/auth/google/callback` and
   `https://www.flyngo.world/api/v1/auth/facebook/callback` (use your configured
   canonical website host). Do not route callbacks directly to a different API
   hostname, because host-scoped cookies intentionally do not cross subdomains.
   Facebook's existing visibility/review setting is unchanged.
5. Preserve Set-Cookie, Origin and X-Requested-With through the reverse proxy.
   Serve production over HTTPS. Do not cache auth POST responses. No new secret
   environment variable is required; keep the existing strong access signing key.
6. Set `JWT_ACCESS_EXPIRY=15m` and choose `JWT_REFRESH_EXPIRY` according to the
   client's session policy. Immediate logout/revocation works independently of
   the remaining access-token lifetime.
7. For retention, periodically remove expired session rows after the agreed
   investigation window; child token hashes cascade. For example, an operator
   can schedule `DELETE FROM auth_sessions WHERE expires_at < NOW() - INTERVAL
   '7 days';` after approving that retention policy. Do not purge used-token
   history for a still-live session, because it enables replay detection.

Rollback must account for both the database and frontend/backend authentication
contract. Prefer a forward fix; old JWT-only guards would bypass session revocation.

## Acceptance checks

- In browser storage, verify refresh cookies are HttpOnly/Secure and no access/refresh credential
  appears in `flyngo-auth`, localStorage, sessionStorage or an OAuth redirect URL.
- Login, register and complete a temporary-password change. Confirm response JSON
  has an access token but no refresh token, and that a page reload restores login.
- Check customer/admin pages, private document downloads and guest booking on reload.
- Refresh twice: each response must set a different refresh cookie. In an isolated
  test client, replay the consumed token and confirm that family's access and
  refresh credentials are rejected afterward.
- Sign out, then retry an earlier access token: protected requests must return 401.
  Repeat using Sign out all devices; another user's session must stay usable.
- Reset/change the password, disable/reactivate or delete a disposable account;
  old sessions must remain unusable.
- Check two tabs: normal refreshes should serialize; logout updates both tabs.
  An offline logout should report failure and offer a retry.
- Verify guest page loads restore as anonymous without expected 401 console noise.
- Verify Google/Facebook callback settings and real provider sign-in in staging;
  provider consent/network behavior is not established by the mocked-provider tests.

PostgreSQL/HTTP session tests use `SESSION_TEST_DATABASE_URL` and accept only the
disposable localhost database `flyngo_sessions_test`. They cover cookie flags,
rotation, concurrent replay, logout, origin checks, expiry, password changes,
deactivation, account deletion, cookie-only restoration and credential-free
OAuth redirects. Actual provider handshakes require deployment verification.
