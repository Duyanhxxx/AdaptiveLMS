import { apiClient } from './api-client';
import type { Recommendation } from '@/types';

export const recommendationsService = {
  generate: () =>
    apiClient<Recommendation>('/recommendations/generate', { method: 'POST' }),

  getLatest: () => apiClient<Recommendation | { message: string }>('/recommendations/latest'),
};
