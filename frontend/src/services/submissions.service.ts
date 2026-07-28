import { apiClient } from './api-client';
import type {
  EssayGradingSuggestion,
  PaginatedResponse,
  Submission,
} from '@/types';

export const submissionsService = {
  create: (quizId: string) =>
    apiClient<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    }),

  submit: (
    id: string,
    data: { answers: Array<{ questionId: string; answerText: string }>; timeSpent?: number },
  ) =>
    apiClient<Submission>(`/submissions/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient<PaginatedResponse<Submission>>(`/submissions${query}`);
  },

  getById: (id: string) => apiClient<Submission>(`/submissions/${id}`),

  gradeEssay: (data: { answerId: string; pointsEarned: number; feedback?: string }) =>
    apiClient<Submission>('/submissions/grade-essay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  suggestGrade: (answerId: string) =>
    apiClient<EssayGradingSuggestion>(`/submissions/suggest-grade/${answerId}`, {
      method: 'POST',
    }),

  getPendingCount: () => apiClient<number>('/submissions/pending-count'),
};
