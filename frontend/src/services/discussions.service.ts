import { apiClient } from './api-client';

export interface CommentItem {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; role: string };
  replies?: CommentItem[];
}

export interface ReactionResponse {
  counts: Record<string, number>;
  myReactions: string[];
}

export const discussionsService = {
  getComments: (lessonId: string) =>
    apiClient<CommentItem[]>(`/discussions/comments/${lessonId}`),

  addComment: (data: { lessonId: string; content: string; parentId?: string }) =>
    apiClient<CommentItem>('/discussions/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReactions: (lessonId: string) =>
    apiClient<ReactionResponse>(`/discussions/reactions/${lessonId}`),

  toggleReaction: (data: { lessonId: string; type: string }) =>
    apiClient<{ action: string; type: string }>('/discussions/reactions/toggle', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
