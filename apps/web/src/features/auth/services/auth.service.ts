import type { LoginFormData, SignupFormData } from '../utils/validation';
import type { AuthSession, User } from '../types';
import { ApiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const authService = {
  async login(data: LoginFormData): Promise<AuthSession> {
    return ApiClient.post<AuthSession>(ENDPOINTS.AUTH.LOGIN, data, { skipAuth: true });
  },

  async signup(data: SignupFormData): Promise<AuthSession> {
    return ApiClient.post<AuthSession>(ENDPOINTS.AUTH.REGISTER, data, { skipAuth: true });
  },

  async logout(): Promise<void> {
    return ApiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
  },

  async verifySession(): Promise<User> {
    return ApiClient.get<User>(ENDPOINTS.AUTH.ME);
  }
};
