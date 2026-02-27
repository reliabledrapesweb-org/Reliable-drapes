/**
 * Zustand auth store for global authentication state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, AuthSession } from '@/lib/types';
import type { DealerSession } from '@/lib/constants/dealer';

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
  dealerSession: DealerSession | null;

  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDealerSession: (dealerSession: DealerSession | null) => void;
  isDealer: () => boolean;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      dealerSession: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setDealerSession: (dealerSession) => set({ dealerSession }),

      isDealer: () => {
        const { dealerSession } = get();
        return dealerSession?.isAuthenticated === true;
      },

      logout: () =>
        set({
          user: null,
          session: null,
          error: null,
        }),

      reset: () =>
        set({
          user: null,
          session: null,
          isLoading: false,
          error: null,
          dealerSession: null,
        }),
    }),
    {
      name: 'dealer-session-storage',
      partialize: (state) => ({
        dealerSession: state.dealerSession,
      }),
    }
  )
);
