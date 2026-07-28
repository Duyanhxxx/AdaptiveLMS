import { apiClient } from './api-client';
import type { PaginatedResponse, Question, Quiz } from '@/types';

export const quizService = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient<PaginatedResponse<Quiz>>(`/quizzes${query}`);
  },

  getById: (id: string, includeAnswers = false) =>
    apiClient<Quiz>(
      `/quizzes/${id}${includeAnswers ? '?includeAnswers=true' : ''}`,
    ),

  create: (data: {
    lessonId: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passingScore?: number;
  }) =>
    apiClient<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Quiz>) =>
    apiClient<Quiz>(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/quizzes/${id}`, { method: 'DELETE' }),

  addQuestion: (
    quizId: string,
    data: {
      text: string;
      type?: string;
      options?: string[];
      correctAnswer?: string;
      points?: number;
      order?: number;
      topic?: string;
    },
  ) =>
    apiClient<Question>(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateQuestion: (id: string, data: Partial<Question>) =>
    apiClient<Question>(`/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteQuestion: (id: string) =>
    apiClient<{ message: string }>(`/questions/${id}`, { method: 'DELETE' }),
};
