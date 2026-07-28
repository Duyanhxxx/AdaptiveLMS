import { apiClient } from './api-client';
import type { PaginatedResponse, Role, User } from '@/types';

export const usersService = {
  list: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient<PaginatedResponse<User>>(`/users${query}`);
  },

  createByAdmin: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
  }) =>
    apiClient<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

