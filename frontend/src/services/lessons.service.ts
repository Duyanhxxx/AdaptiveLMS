import { apiClient } from './api-client';
import type { Lesson, LessonDetail, PaginatedResponse } from '@/types';

export const lessonsService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient<PaginatedResponse<Lesson>>(`/lessons${query}`);
  },

  getById: (id: string) => apiClient<LessonDetail>(`/lessons/${id}`),

  create: (data: {
    courseId: string;
    title: string;
    content: string;
    order?: number;
    duration?: number;
    difficulty?: string;
    topics?: string[];
    isPublished?: boolean;
  }) =>
    apiClient<Lesson>('/lessons', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Lesson & { content: string }>) =>
    apiClient<Lesson>(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/lessons/${id}`, { method: 'DELETE' }),

  reorder: (courseId: string, lessonIds: string[]) =>
    apiClient<Lesson[]>('/lessons/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ courseId, lessonIds }),
    }),
};
