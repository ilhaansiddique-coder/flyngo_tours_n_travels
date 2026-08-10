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

function clearAuthAndRedirect() {
  if (typeof document === 'undefined') return;
  document.cookie = 'flyngo-auth=; path=/; max-age=0';
  if (window.location.pathname.startsWith('/admin')) {
    window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
  }
}

class ApiClient {
  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthAndRedirect();
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
      return { data: unwrapped.items, meta: unwrapped.meta } as T;
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

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const headers: Record<string, string> = { ...(fetchOptions.headers as Record<string, string>) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      headers,
    });
    if (!response.ok) {
      if (response.status === 401) clearAuthAndRedirect();
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new ApiError(response.status, error.message || 'Upload failed', error.errors);
    }
    const json = await response.json();
    return (json.data ?? json) as T;
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
