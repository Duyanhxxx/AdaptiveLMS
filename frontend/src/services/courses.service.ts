import { apiClient } from './api-client';
import type { Course, Lesson, PaginatedResponse } from '@/types';

export const coursesService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient<PaginatedResponse<Course>>(`/courses${query}`);
  },

  getById: (id: string) =>
    apiClient<Course & { lessons: Lesson[] }>(`/courses/${id}`),

  create: (data: {
    title: string;
    description: string;
    difficulty?: string;
    isPublished?: boolean;
  }) =>
    apiClient<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Course>) =>
    apiClient<Course>(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/courses/${id}`, { method: 'DELETE' }),
};
