export interface AiRecommendationInput {
  studentName: string;
  currentScore: number;
  averageScore: number;
  studentGroup: 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';
  weakTopics: string[];
  strongTopics: string[];
  timeSpentMinutes: number;
  recentHistory: Array<{
    action: string;
    score?: number;
    topics: string[];
    date: string;
  }>;
  availableLessons: Array<{
    id: string;
    title: string;
    difficulty: string;
    topics: string[];
  }>;
}

export interface AiRecommendationOutput {
  learningLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  studentGroup: 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';
  groupStrategy: string;
  strengths: string[];
  weaknesses: string[];
  recommendedLessonIds: string[];
  practicePlan: {
    daily: string[];
    weekly: string[];
    focusAreas: string[];
  };
  motivationalFeedback: string;
  explanation: string;
}
