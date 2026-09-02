import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
  } | null;
  // True once the persisted cookie has been rehydrated. Guards that redirect
  // unauthenticated users must wait for this, otherwise a page reload fires a
  // race: on the first render the store is still empty, so a `if (!user)
  // redirect` bounces an already-logged-in user to /auth/login. Hydration from
  // a localStorage/session cookie is synchronous, but the React render can
  // still observe the pre-hydration state, so we gate on this flag.
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0`;
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, hasHydrated: true }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'flyngo-auth',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // Flip the flag once the cookie has been read so auth guards can wait
        // for hydration before deciding whether to redirect to /auth/login.
        state?.setHasHydrated?.(true);
      },
    },
  ),
);
