import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ApiClient, tokenStore } from '@/api/apiClient'
import { ENDPOINTS } from '@/api/endpoints'
import type { LoginFormData, SignupFormData } from '../utils/validation'

export interface User {
  id: string
  email: string
  fullName: string
  role: 'STUDENT' | 'ADMIN' | 'REVIEWER'
  isEmailVerified: boolean
  onboardingComplete: boolean
  createdAt: string
}

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isRestoringSession: boolean
  error: string | null

  login: (data: LoginFormData) => Promise<void>
  signup: (data: SignupFormData) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  clearSession: () => void
  clearError: () => void
  setTokens: (accessToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      isRestoringSession: true,
      error: null,

      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null })
        try {
          const res = await ApiClient.post<{ user: User; accessToken: string }>(
            ENDPOINTS.AUTH.LOGIN,
            data,
            { skipAuth: true },
          )
          tokenStore.set(res.accessToken)
          set({ currentUser: res.user, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'Login failed' })
          throw err
        }
      },

      signup: async (data: SignupFormData) => {
        set({ isLoading: true, error: null })
        try {
          const res = await ApiClient.post<{ user: User; accessToken: string }>(
            ENDPOINTS.AUTH.REGISTER,
            data,
            { skipAuth: true },
          )
          tokenStore.set(res.accessToken)
          set({ currentUser: res.user, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'Signup failed' })
          throw err
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await ApiClient.post(ENDPOINTS.AUTH.LOGOUT)
        } catch { /* ignore */ } finally {
          tokenStore.clear()
          set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null })
        }
      },

      restoreSession: async () => {
        set({ isRestoringSession: true })
        try {
          // Try to get a new access token using the HttpOnly refresh cookie
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          })

          if (res.ok) {
            const data = await res.json()
            tokenStore.set(data.accessToken)
            set({ currentUser: data.user, isAuthenticated: true })
          } else {
            tokenStore.clear()
            set({ currentUser: null, isAuthenticated: false })
          }
        } catch {
          tokenStore.clear()
          set({ currentUser: null, isAuthenticated: false })
        } finally {
          set({ isRestoringSession: false })
        }
      },

      clearSession: () => {
        tokenStore.clear()
        set({ currentUser: null, isAuthenticated: false, isRestoringSession: false })
      },

      clearError: () => set({ error: null }),

      setTokens: (accessToken: string) => {
        tokenStore.set(accessToken)
      },
    }),
    {
      name: 'vidyut-auth',
      // Only persist user identity — access token lives in memory only
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
