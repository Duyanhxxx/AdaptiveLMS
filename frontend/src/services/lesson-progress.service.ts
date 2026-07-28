import { apiClient } from './api-client';

export const lessonProgressService = {
  markViewed: (lessonId: string, timeSpent?: number) =>
    apiClient<{ message: string }>(`/lesson-progress/${lessonId}/viewed`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    }),

  markCompleted: (lessonId: string, timeSpent?: number) =>
    apiClient<{ message: string }>(`/lesson-progress/${lessonId}/completed`, {
      method: 'POST',
      body: JSON.stringify({ timeSpentSeconds: timeSpent }),
    }),

  getCourseProgress: (courseId: string) =>
    apiClient<{
      courseId: string;
      progress: number;
      totalLessons: number;
      completedCount: number;
      lessons: Array<{ id: string; title: string; order: number; completed: boolean }>;
    }>(`/lesson-progress/course/${courseId}`),
};
