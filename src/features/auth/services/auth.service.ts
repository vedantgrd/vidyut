import type { LoginFormData, SignupFormData } from '../utils/validation';
import type { AuthSession, User } from '../types';

/**
 * Authentication Service
 * Abstracts away fetch() calls. Currently mocked to simulate network latency
 * and success/failure scenarios. Ready for direct replacement with real fetch/axios logic.
 */

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUser: User = {
  id: 'user_123',
  email: 'student@example.com',
  fullName: 'Vidyut Student',
  role: 'student',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
};

export const authService = {
  async login(data: LoginFormData): Promise<AuthSession> {
    await delay(1200); // Simulate network latency

    if (data.email === 'error@example.com') {
      throw new Error('Invalid credentials');
    }

    return {
      user: { ...mockUser, email: data.email },
      accessToken: 'mock_jwt_access_token_abc123',
      refreshToken: 'mock_jwt_refresh_token_xyz789',
    };
  },

  async signup(data: SignupFormData): Promise<AuthSession> {
    await delay(1500);

    if (data.email === 'taken@example.com') {
      throw new Error('Email is already registered');
    }

    return {
      user: {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        fullName: data.fullName,
        role: 'student',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'mock_jwt_access_token_new_user',
      refreshToken: 'mock_jwt_refresh_token_new_user',
    };
  },

  async logout(): Promise<void> {
    await delay(500);
    // In production, this would hit a /logout endpoint to invalidate the refresh token
  },

  async verifySession(token: string): Promise<User> {
    await delay(500);
    if (!token) throw new Error('No token provided');
    return mockUser;
  }
};
