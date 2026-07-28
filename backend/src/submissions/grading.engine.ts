import { Injectable } from '@nestjs/common';
import { QuestionType, Role } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { classifyStudentGroup } from '../common/utils/student-group.util';

@Injectable()
export class GradingEngine {
  constructor(private readonly aiService: AiService) {}

  gradeAnswer(
    question: { type: QuestionType; correctAnswer: string | null; points: number },
    answerText: string,
  ) {
    if (question.type === QuestionType.ESSAY) {
      return { isCorrect: null, pointsEarned: 0, feedback: 'Pending review' };
    }

    const isCorrect =
      question.correctAnswer?.trim().toLowerCase() ===
      answerText.trim().toLowerCase();

    return {
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect',
    };
  }

  async suggestEssayGrade(
    answer: any,
    userId: string,
    role: Role,
  ) {
    const avgScore = answer.submission.student.studentProfile?.averageScore ?? 50;
    const studentGroup = classifyStudentGroup(avgScore);

    return this.aiService.suggestEssayGrade({
      questionText: answer.question.text,
      maxPoints: answer.question.points,
      topic: answer.question.topic ?? undefined,
      studentAnswer: answer.answerText,
      studentGroup,
      studentName: `${answer.submission.student.firstName} ${answer.submission.student.lastName}`,
    });
  }

  buildTopicResults(
    answers: Array<{
      isCorrect: boolean | null;
      question: { topic: string | null; type: QuestionType };
    }>,
  ) {
    const topicResults: Record<string, { correct: number; total: number }> = {};

    for (const a of answers) {
      if (!a.question.topic || a.question.type === QuestionType.ESSAY) continue;
      if (!topicResults[a.question.topic]) {
        topicResults[a.question.topic] = { correct: 0, total: 0 };
      }
      topicResults[a.question.topic].total++;
      if (a.isCorrect) topicResults[a.question.topic].correct++;
    }

    return topicResults;
  }
}
