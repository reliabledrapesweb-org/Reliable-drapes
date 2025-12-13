/**
 * Zustand auth store for global authentication state management
 */

import { create } from 'zustand';
import type { AuthUser, AuthSession } from '@/lib/types';

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => set({
    user: null,
    session: null,
    error: null,
  }),

  reset: () => set({
    user: null,
    session: null,
    isLoading: false,
    error: null,
  }),
}));
