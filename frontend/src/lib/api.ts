import { useAuthStore } from '@/stores/auth.store';
import { withSessionLock } from './session-lock';

const API_BASE = '/api/v1';

if (typeof window !== 'undefined' && /^https?:\/\//i.test(API_BASE)) {
  throw new Error(
    `[api] API_BASE must be a relative path so the Next.js rewrite can proxy it. ` +
      `Got absolute URL: ${API_BASE}. Use '/api/v1' and set BACKEND_URL in the environment.`,
  );
}

interface FetchOptions extends RequestInit {
  token?: string;
}

interface RefreshResponse {
  accessToken?: string;
}

type RefreshResult = { ok: true; accessToken: string } | { ok: false; reason: 'invalid' | 'error' };

function clearAuthAndRedirect() {
  useAuthStore.getState().clearSession();
  if (typeof document === 'undefined') return;
  document.cookie = 'flyngo-auth=; path=/; max-age=0';
  if (window.location.pathname.startsWith('/admin')) {
    window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
  }
}

/**
 * Read the `exp` (seconds) claim from a JWT without verifying its signature.
 * Returns null when the token isn't a decodable JWT.
 */
function decodeJwtExp(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(part))));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/** Refresh buffer (seconds): proactively renew when the token expires within this window. */
const TOKEN_EXPIRY_BUFFER = 30;


export class ApiClient {
  private refreshPromise: Promise<RefreshResult> | null = null;
  private bootstrapPromise: Promise<void> | null = null;

  async initializeSession(force = false): Promise<void> {
    if (useAuthStore.getState().hasHydrated && !force) return;
    if (this.bootstrapPromise) return this.bootstrapPromise;
    this.bootstrapPromise = (async () => {
      try {
        const result = await this.refreshAccessToken(true);
        if (result.ok) {
          const user = await this.get<{ id: string; email: string | null; fullName: string;
            role: { code: string; permissions: { permission: { code: string } }[] } }>('/users/me', { token: result.accessToken });
          if (useAuthStore.getState().accessToken === result.accessToken) useAuthStore.getState().setUser({
            id: user.id, email: user.email || '', fullName: user.fullName, role: user.role.code,
            permissions: user.role.permissions.map((item) => item.permission.code),
          });
        } else if (result.reason === 'invalid') useAuthStore.getState().clearSession();
      } finally {
        useAuthStore.getState().setHasHydrated(true);
        this.bootstrapPromise = null;
      }
    })();
    return this.bootstrapPromise;
  }

  /**
   * Try to refresh the access token. Distinguishes a genuinely invalid session
   * (refresh token rejected → 'invalid') from a transient failure (network /
   * 5xx → 'error'). Only a definitive 'invalid' should end the session — this
   * prevents the app from bouncing an already-logged-in user to /auth/login on
   * a momentary blip (the reported bug).
   */
  private async refreshAccessToken(restore = false): Promise<RefreshResult> {
    if (this.refreshPromise) return this.refreshPromise;
    const epoch = useAuthStore.getState().sessionEpoch;
    this.refreshPromise = (async (): Promise<RefreshResult> => {
      try {
        const rotate = async (): Promise<RefreshResult> => {
          if (useAuthStore.getState().sessionEpoch !== epoch) return { ok: false, reason: 'error' };
          const response = await fetch(`${API_BASE}/auth/${restore ? 'session' : 'refresh'}`, {
            method: 'POST',
            credentials: 'same-origin', cache: 'no-store',
            headers: { 'X-Requested-With': 'Flyngo' },
          });
          if (!response.ok) return { ok: false, reason: [401, 403].includes(response.status) ? 'invalid' : 'error' };
          let json: any = {};
          try {
            json = await response.json();
          } catch {
            return { ok: false, reason: 'error' };
          }
          const tokens = (json.data ?? json) as RefreshResponse;
          if (useAuthStore.getState().sessionEpoch !== epoch) return { ok: false, reason: 'error' };
          if (!tokens.accessToken) return { ok: false, reason: 'invalid' };
          useAuthStore.getState().setTokens(tokens.accessToken);
          return { ok: true, accessToken: tokens.accessToken };
        };
        // Serialize rotation across browser tabs; cookies carry the newest token automatically.
        return await withSessionLock(rotate);
      } catch {
        return { ok: false, reason: 'error' };
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Decide what to do after a 401. Returns true when a retried request should be
   * returned (refresh succeeded). Only a definitive session expiry redirects to
   * login; transient errors and tokenless (pre-hydration) requests keep the
   * session intact.
   */
  private async resolve401<T>(endpoint: string, options: FetchOptions, allowRefresh: boolean): Promise<T | null> {
    if (/^\/auth\/(login|register|refresh|logout|change-password)/.test(endpoint)) return null;
    if (allowRefresh) {
      const result = await this.refreshAccessToken();
      if (result.ok) {
        return this.request<T>(endpoint, { ...options, token: result.accessToken }, false);
      }
      // result.reason === 'invalid' → session truly over; end it.
      // reason === 'error' → transient blip; keep the session, surface error.
      if (result.reason === 'invalid') clearAuthAndRedirect();
      return null;
    }

    clearAuthAndRedirect();
    return null;
  }

  /**
   * Resolve the access token to send: if a (near-)expired token is supplied we
   * proactively refresh it so the request carries a valid token. This matters
   * for PUBLIC endpoints (e.g. POST /bookings) that return 200 regardless of an
   * invalid token — without it, a logged-in user with a stale access token
   * would be silently treated as a guest and their booking wouldn't be linked
   * to their account (no 401 is raised, so the normal refresh-on-401 path never
   * runs).
   */
  private async resolveToken(providedToken: string | undefined, allowRefresh: boolean): Promise<string | undefined> {
    if (!useAuthStore.getState().hasHydrated && !providedToken && allowRefresh) await this.initializeSession().catch(() => undefined);
    let token = providedToken ?? useAuthStore.getState().accessToken ?? undefined;
    if (!token || !allowRefresh) return token;

    const exp = decodeJwtExp(token);
    const now = Math.floor(Date.now() / 1000);
    if (exp !== null && exp - now < TOKEN_EXPIRY_BUFFER) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed.ok) return refreshed.accessToken;
    }
    return token;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}, allowRefresh = true): Promise<T> {
    const { token: providedToken, ...fetchOptions } = options;
    const token = await this.resolveToken(providedToken, allowRefresh);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'Flyngo',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const send = () => fetch(`${API_BASE}${endpoint}`, {
      credentials: 'same-origin',
      ...fetchOptions,
      headers,
    });
    const response = /^\/auth\/(login|register|change-password|logout)/.test(endpoint) ? await withSessionLock(send) : await send();

    if (!response.ok) {
      if (response.status === 401) {
        const retried = await this.resolve401<T>(endpoint, options, allowRefresh);
        if (retried) return retried;
      }
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new ApiError(response.status, error.message || 'Request failed', error.errors);
    }

    const json = await response.json();
    const unwrapped = json.data ?? json;

    if (
      unwrapped &&
      typeof unwrapped === 'object' &&
      !Array.isArray(unwrapped) &&
      Array.isArray(unwrapped.items) &&
      unwrapped.meta
    ) {
      // Expose the list under BOTH `data` and `items` so callers work whether
      // they read `res.data` (tours/hotels/…) or `res.items` (hajj/umrah/visa/
      // admin/dashboard/…). Historically these diverged and half the pages
      // silently rendered empty. Keeping both keys makes the shape forgiving.
      return { data: unwrapped.items, items: unwrapped.items, meta: unwrapped.meta } as T;
    }

    return unwrapped as T;
  }

  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  }

  // NOTE: 2nd arg is `options` (matching get()), NOT a body — every caller does
  // `api.delete(url, auth())`, so options must be here or the auth token is lost
  // and every delete 401s. A body, when needed, goes in options.body.
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: FetchOptions = {},
    allowRefresh = true,
  ): Promise<T> {
    const { token: providedToken, ...fetchOptions } = options;
    const token = await this.resolveToken(providedToken, allowRefresh);
    const headers: Record<string, string> = { ...(fetchOptions.headers as Record<string, string>) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      headers,
    });
    if (!response.ok) {
      if (response.status === 401) {
        // Same refresh-and-retry behaviour as request(): a shot of 401 on an
        // upload means the access token expired, not that the user logged out.
        const retried = await this.resolve401<T>(endpoint, options, allowRefresh);
        if (retried) return retried;
      }
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new ApiError(response.status, error.message || 'Upload failed', error.errors);
    }
    const json = await response.json();
    return (json.data ?? json) as T;
  }

  async getBlob(
    endpoint: string,
    options: FetchOptions = {},
    allowRefresh = true,
  ): Promise<Blob> {
    const { token: providedToken, ...fetchOptions } = options;
    const token = await this.resolveToken(providedToken, allowRefresh);
    const headers: Record<string, string> = { ...(fetchOptions.headers as Record<string, string>) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && allowRefresh) {
        const result = await this.refreshAccessToken();
        if (result.ok) {
          return this.getBlob(endpoint, { ...options, token: result.accessToken }, false);
        }
        if (result.reason === 'invalid') clearAuthAndRedirect();
      }
      let errorMsg = 'Failed to download file';
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {
        errorMsg = response.statusText || errorMsg;
      }
      throw new ApiError(response.status, errorMsg);
    }

    return await response.blob();
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
