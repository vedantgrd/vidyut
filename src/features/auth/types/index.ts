/**
 * Core Authentication Types
 * Shared across stores, services, and validation schemas.
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'institute' | 'admin';
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  code: string;
  details?: Record<string, string>;
}
