export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  thumbnailUrl?: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  teacher?: { id: string; firstName: string; lastName: string };
  _count?: { lessons: number; enrollments: number };
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  duration: number;
  difficulty: string;
  topics: string[];
  isPublished: boolean;
}

export interface StudentDashboard {
  student: { id: string; name: string };
  progress: {
    completionPercent: number;
    enrolledCourses: number;
    courses: Array<{ id: string; title: string; progress: number }>;
  };
  averageScore: number;
  learningStreak: number;
  totalTimeSpent: number;
  weakTopics: string[];
  strongTopics: string[];
  learningLevel: string;
  recommendedLesson?: {
    id: string;
    title: string;
    duration: number;
    difficulty: string;
    courseId?: string;
  } | null;
  weeklyPerformance: Array<{
    week: string;
    averageScore: number;
    count: number;
  }>;
  recentActivity: Array<{
    action: string;
    score?: number | null;
    topics: string[];
    date: string;
  }>;
  totalSubmissions: number;
}

export interface TeacherDashboard {
  summary: {
    totalCourses: number;
    totalStudents: number;
    classAverageScore: number;
    pendingGrading: number;
  };
  courses: Array<{ id: string; title: string }>;
  studentGroups: Array<{
    key: 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';
    label: string;
    description: string;
    count: number;
    students: Array<{
      id: string;
      name: string;
      email: string;
      averageScore: number;
      learningLevel: string;
      group: string;
    }>;
  }>;
  topStudents: Array<{
    id: string;
    name: string;
    email: string;
    averageScore: number;
    learningLevel: string;
  }>;
  weakStudents: Array<{
    id: string;
    name: string;
    email: string;
    averageScore: number;
  }>;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  lessonId: string;
  questions?: Question[];
  _count?: { questions: number };
}

export interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
  topic?: string;
}

export interface Submission {
  id: string;
  score: number;
  maxScore: number;
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED';
  timeSpent?: number;
  submittedAt?: string;
  gradedAt?: string;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    lesson: { id: string; title: string; courseId: string; topics: string[] };
  };
  student: { id: string; firstName: string; lastName: string; email: string };
  answers: Array<{
    id: string;
    answerText: string;
    isCorrect: boolean | null;
    pointsEarned: number;
    feedback?: string;
    question: { id: string; text: string; type: string; topic?: string; points: number };
  }>;
}

export interface EssayGradingSuggestion {
  suggestedPoints: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  rubricBreakdown: Array<{
    criterion: string;
    score: number;
    maxScore: number;
    comment: string;
  }>;
  explanation: string;
}

export interface StudentGroupsDetail {
  summary: { totalStudents: number; classAverageScore: number };
  groups: Array<{
    key: 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';
    label: string;
    description: string;
    minScore: number;
    maxScore: number;
    count: number;
    students: Array<{
      id: string;
      name: string;
      email: string;
      averageScore: number;
      learningLevel: string;
      learningStreak: number;
      weakTopics: string[];
      strongTopics: string[];
      totalTimeSpent: number;
      lastActiveAt: string | null;
      group: string;
      courses: Array<{ id: string; title: string; progress: number }>;
      recentSubmissions: Array<{
        id: string;
        quizTitle: string;
        score: number;
        maxScore: number;
        percentage: number;
        status: string;
        submittedAt: string | null;
      }>;
    }>;
  }>;
}

export interface LessonDetail extends Lesson {
  courseId: string;
  quizzes?: Array<{
    id: string;
    title: string;
    passingScore: number;
    timeLimit?: number;
    _count?: { questions: number };
  }>;
}

export interface AdminDashboard {
  summary: {
    totalCourses: number;
    totalStudents: number;
    classAverageScore: number;
  };
  topStudents: Array<{
    id: string;
    name: string;
    email: string;
    averageScore: number;
    learningLevel: string;
  }>;
  weakStudents: Array<{
    id: string;
    name: string;
    email: string;
    averageScore: number;
  }>;
}

export interface Recommendation {
  id: string;
  learningLevel: string;
  studentGroup?: 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';
  groupStrategy?: string;
  strengths: string[];
  weaknesses: string[];
  motivationalFeedback: string;
  explanation: string;
  practicePlan: {
    daily: string[];
    weekly: string[];
    focusAreas: string[];
  };
  recommendedLessons?: Array<{
    id: string;
    title: string;
    difficulty: string;
    duration: number;
    topics: string[];
    courseId: string;
  }>;
}
