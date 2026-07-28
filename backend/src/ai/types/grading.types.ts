import type { StudentGroup } from '../../common/utils/student-group.util';

export interface EssayGradingInput {
  questionText: string;
  maxPoints: number;
  topic?: string;
  studentAnswer: string;
  studentGroup: StudentGroup;
  studentName: string;
  rubric?: string;
}

export interface EssayGradingOutput {
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
