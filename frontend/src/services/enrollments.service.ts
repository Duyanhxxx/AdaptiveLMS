import { apiClient } from './api-client';
import type { Course } from '@/types';

export const enrollmentsService = {
  enroll: (courseId: string) =>
    apiClient<{ id: string; course: Course }>(`/enrollments/${courseId}`, {
      method: 'POST',
    }),

  listMine: () =>
    apiClient<Array<{ id: string; progress: number; course: Course }>>('/enrollments/me'),
};
