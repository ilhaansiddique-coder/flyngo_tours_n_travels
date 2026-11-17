jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
import { ApiClient } from './api';
import { useAuthStore } from '@/stores/auth.store';
import { withSessionLock } from './session-lock';

const json = (data: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => ({ data }) });
const profile = { id: 'user-1', email: 'user@example.invalid', fullName: 'User', role: { code: 'customer', permissions: [] } };
describe('memory-only browser sessions', () => {
  let client: ApiClient;
  let fetchMock: jest.Mock;
  beforeEach(() => {
    client = new ApiClient();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    useAuthStore.setState({ accessToken: null, user: null, hasHydrated: false, sessionEpoch: 0 });
  });
  it('restores a page reload using the HttpOnly cookie, without reading or sending a refresh token', async () => {
    fetchMock.mockResolvedValueOnce(json({ accessToken: 'memory-access' })).mockResolvedValueOnce(json(profile));
    await client.initializeSession();
    expect(useAuthStore.getState().accessToken).toBe('memory-access');
    expect(useAuthStore.getState().user?.id).toBe(profile.id);
    expect(useAuthStore.getState()).not.toHaveProperty('refreshToken');
    expect(fetchMock.mock.calls[0]).toEqual(['/api/v1/auth/session', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'X-Requested-With': 'Flyngo' },
    }]);
  });
  it('deduplicates concurrent bootstrap calls', async () => {
    fetchMock.mockResolvedValueOnce(json({ accessToken: 'access' })).mockResolvedValueOnce(json(profile));
    await Promise.all([client.initializeSession(), client.initializeSession(), client.initializeSession()]);
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/v1/auth/session')).toHaveLength(1);
  });
  it('treats a missing/expired cookie as an anonymous session', async () => {
    fetchMock.mockResolvedValueOnce(json({ authenticated: false }));
    await client.initializeSession();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: null, user: null, hasHydrated: true });
  });
  it('does not clear an existing session for a transient refresh failure', async () => {
    useAuthStore.setState({ accessToken: 'existing', user: { ...profile, email: profile.email, role: 'customer', permissions: [] }, hasHydrated: true });
    fetchMock.mockResolvedValueOnce(json({}, 503));
    await client.initializeSession(true);
    expect(useAuthStore.getState().accessToken).toBe('existing');
  });
  it('does not resurrect credentials when logout occurs during an in-flight refresh', async () => {
    let finish!: (value: unknown) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const pending = client.initializeSession();
    // Let the serialized request begin, then invalidate its authentication epoch.
    await Promise.resolve(); await Promise.resolve();
    useAuthStore.getState().clearSession();
    finish(json({ accessToken: 'stale-access' }));
    await pending;
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
  it('waits for successful server revocation before completing logout', async () => {
    useAuthStore.setState({ accessToken: 'access', hasHydrated: true });
    fetchMock.mockResolvedValueOnce(json({ success: true }));
    expect(await useAuthStore.getState().logout()).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/logout', expect.objectContaining({ method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': 'Flyngo', Authorization: 'Bearer access' } }));
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
  it('does not pretend logout succeeded if the server cannot be reached', async () => {
    useAuthStore.setState({ accessToken: 'access', hasHydrated: true });
    fetchMock.mockRejectedValueOnce(new Error('Offline'));
    expect(await useAuthStore.getState().logout()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBe('access');
  });
  it('serializes competing session operations in browsers without Web Locks', async () => {
    const order: string[] = [];
    let finish!: () => void;
    const first = withSessionLock(async () => { order.push('rotate-start'); await new Promise<void>((resolve) => { finish = resolve; }); order.push('rotate-end'); });
    const second = withSessionLock(async () => { order.push('logout'); });
    await Promise.resolve(); await Promise.resolve();
    expect(order).toEqual(['rotate-start']);
    finish();
    await Promise.all([first, second]);
    expect(order).toEqual(['rotate-start', 'rotate-end', 'logout']);
  });
});
