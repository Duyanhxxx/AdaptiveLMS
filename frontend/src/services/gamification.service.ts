import { apiClient } from './api-client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface GamificationBadgesResponse {
  earned: UserBadge[];
  all: Badge[];
}

export interface Certificate {
  id: string;
  courseId: string;
  pdfUrl: string | null;
  issuedAt: string;
  course: {
    title: string;
  };
}

export const gamificationService = {
  getMyBadges: () =>
    apiClient<GamificationBadgesResponse>('/gamification/my-badges'),

  getMyCertificates: () =>
    apiClient<Certificate[]>('/gamification/my-certificates'),
};
