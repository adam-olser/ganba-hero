/**
 * Auth Store (Zustand)
 * 
 * Manages authentication state and user session.
 */

import { create } from 'zustand';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  // State
  status: AuthStatus;
  user: User | null;
  isOnboarded: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  setOnboarded: (onboarded: boolean) => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  status: 'loading',
  user: null,
  isOnboarded: false,
  
  // Actions
  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  
  setStatus: (status) => set({ status }),
  
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  
  signOut: () => set({
    user: null,
    status: 'unauthenticated',
    isOnboarded: false,
  }),
  
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
  })),
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectAuthStatus = (state: AuthState) => state.status;
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated';
export const selectIsAnonymous = (state: AuthState) => state.user?.isAnonymous ?? false;

