import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import type { LoginFormData, SignupFormData } from '../utils/validation';
import type { User, AuthError } from '../types';

interface AuthState {
  currentUser: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  
  // Actions
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const session = await authService.login(data);
          set({
            currentUser: session.user,
            accessToken: session.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: { message: error.message || 'Login failed', code: 'LOGIN_ERROR' },
          });
          throw error;
        }
      },

      signup: async (data: SignupFormData) => {
        set({ isLoading: true, error: null });
        try {
          const session = await authService.signup(data);
          set({
            currentUser: session.user,
            accessToken: session.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: { message: error.message || 'Signup failed', code: 'SIGNUP_ERROR' },
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({
            currentUser: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vidyut-auth-storage',
      // In production, only persist the token, not the whole user object if it contains sensitive data,
      // but for this implementation we persist state to maintain session across reloads.
      partialize: (state) => ({ 
        currentUser: state.currentUser, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
