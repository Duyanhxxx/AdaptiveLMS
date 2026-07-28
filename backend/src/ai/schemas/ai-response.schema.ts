import { z } from 'zod';

export const AiRecommendationSchema = z.object({
  learningLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  studentGroup: z.enum(['EXCELLENT', 'AVERAGE', 'NEEDS_SUPPORT']),
  groupStrategy: z.string().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendedLessonIds: z.array(z.string()),
  practicePlan: z.object({
    daily: z.array(z.string()),
    weekly: z.array(z.string()),
    focusAreas: z.array(z.string()),
  }),
  motivationalFeedback: z.string().optional(),
  explanation: z.string().optional(),
});

export const EssayGradingSchema = z.object({
  suggestedPoints: z.number(),
  feedback: z.string(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  rubricBreakdown: z.array(
    z.object({
      criterion: z.string(),
      score: z.number(),
      maxScore: z.number(),
      comment: z.string(),
    })
  ).optional(),
  explanation: z.string().optional(),
});
