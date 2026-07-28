import { apiClient } from './api-client';
import type { AuthTokens, User } from '@/types';

interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) =>
    apiClient<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiClient<User & { studentProfile?: unknown }>('/auth/me'),

  logout: (refreshToken: string) =>
    apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};
