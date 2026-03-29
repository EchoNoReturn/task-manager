import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'member';

interface User {
  id: string;
  email: string;
  role: UserRole;
  nickname: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user, isAdmin: user?.role === 'admin' }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
