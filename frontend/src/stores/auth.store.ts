import { create } from 'zustand';
import { toast } from 'sonner';
import { withSessionLock } from '@/lib/session-lock';

interface AuthState {
  accessToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
  } | null;
  // Guards wait until the HttpOnly-cookie session and profile have been restored.
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  sessionEpoch: number;
  setTokens: (accessToken: string) => void;
  setUser: (user: AuthState['user']) => void;
  clearSession: () => void;
  logout: () => Promise<boolean>;
  isAuthenticated: () => boolean;
}

export function broadcastSession(event: 'login' | 'logout') {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel('flyngo-session');
  channel.postMessage(event);
  channel.close();
}

// Credentials and profile stay in memory. The server owns the HttpOnly refresh cookie.
export const useAuthStore = create<AuthState>()((set, get) => ({
      accessToken: null,
      user: null,
      hasHydrated: false,
      sessionEpoch: 0,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setTokens: (accessToken) => set((state) => ({ accessToken, sessionEpoch: state.sessionEpoch + 1 })),
      setUser: (user) => set({ user, hasHydrated: true }),
      clearSession: () => set((state) => ({ accessToken: null, user: null, hasHydrated: true, sessionEpoch: state.sessionEpoch + 1 })),
      logout: async () => {
        set((state) => ({ sessionEpoch: state.sessionEpoch + 1 }));
        try {
          const response = await withSessionLock(() => fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin',
            headers: { 'X-Requested-With': 'Flyngo', ...(get().accessToken ? { Authorization: `Bearer ${get().accessToken}` } : {}) }, cache: 'no-store', keepalive: true }));
          if (!response.ok) throw new Error('Logout failed');
          get().clearSession();
          broadcastSession('logout');
          return true;
        } catch {
          toast.error('Could not sign out. Please try again.');
          return false;
        }
      },
      isAuthenticated: () => !!get().accessToken,
}));
