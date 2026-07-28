import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  HistoryAction,
  NotificationType,
  Prisma,
  QuestionType,
  Role,
  SubmissionStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import {
  CreateSubmissionDto,
  GradeEssayDto,
  SubmitAnswersDto,
} from './dto/submission.dto';
import { AiService } from '../ai/ai.service';
import { GradingEngine } from './grading.engine';
import { NotificationsService } from '../notifications/notifications.service';
import {
  classifyStudentGroup,
} from '../common/utils/student-group.util';

const SUBMISSION_INCLUDE = {
  quiz: {
    select: {
      id: true,
      title: true,
      passingScore: true,
      lesson: {
        select: {
          id: true,
          title: true,
          courseId: true,
          topics: true,
        },
      },
    },
  },
  student: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  answers: {
    include: {
      question: {
        select: { id: true, text: true, type: true, topic: true, points: true },
      },
    },
  },
} satisfies Prisma.SubmissionInclude;

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    private readonly gradingEngine: GradingEngine,
  ) {}

  async create(dto: CreateSubmissionDto, studentId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const completed = await this.prisma.submission.findFirst({
      where: {
        studentId,
        quizId: dto.quizId,
        status: { not: SubmissionStatus.DRAFT },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (completed) return this.findOne(completed.id, studentId, Role.STUDENT);

    const draft = await this.prisma.submission.findFirst({
      where: {
        studentId,
        quizId: dto.quizId,
        status: SubmissionStatus.DRAFT,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (draft) return this.findOne(draft.id, studentId, Role.STUDENT);

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const submission = await this.prisma.submission.create({
      data: {
        studentId,
        quizId: dto.quizId,
        maxScore,
        status: SubmissionStatus.DRAFT,
      },
      include: SUBMISSION_INCLUDE,
    });

    await this.prisma.learningHistory.create({
      data: {
        studentId,
        quizId: dto.quizId,
        lessonId: quiz.lessonId,
        action: HistoryAction.QUIZ_STARTED,
        topics: quiz.questions.map((q) => q.topic).filter(Boolean) as string[],
      },
    });

    return submission;
  }

  async submit(
    id: string,
    dto: SubmitAnswersDto,
    studentId: string,
  ) {
    const submission = await this.getOwnedSubmission(id, studentId);

    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new BadRequestException('Submission already submitted');
    }

    const questions = await this.prisma.question.findMany({
      where: { quizId: submission.quizId },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    let totalScore = 0;
    let hasEssay = false;
    const topicResults: Record<string, { correct: number; total: number }> = {};

    const answerRecords = dto.answers.map((a) => {
      const question = questionMap.get(a.questionId);
      if (!question) {
        throw new BadRequestException(`Question ${a.questionId} not found in quiz`);
      }

      const graded = this.gradingEngine.gradeAnswer(question, a.answerText);
      if (question.type === QuestionType.ESSAY) hasEssay = true;

      totalScore += graded.pointsEarned;

      if (question.topic) {
        if (!topicResults[question.topic]) {
          topicResults[question.topic] = { correct: 0, total: 0 };
        }
        topicResults[question.topic].total++;
        if (graded.isCorrect) topicResults[question.topic].correct++;
      }

      return {
        questionId: a.questionId,
        answerText: a.answerText,
        isCorrect: graded.isCorrect,
        pointsEarned: graded.pointsEarned,
        feedback: graded.feedback,
      };
    });

    const status = hasEssay
      ? SubmissionStatus.SUBMITTED
      : SubmissionStatus.GRADED;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({ where: { submissionId: id } });

      const result = await tx.submission.update({
        where: { id },
        data: {
          score: totalScore,
          status,
          timeSpent: dto.timeSpent ?? submission.timeSpent,
          submittedAt: new Date(),
          gradedAt: hasEssay ? null : new Date(),
          answers: { create: answerRecords },
        },
        include: SUBMISSION_INCLUDE,
      });

      await tx.learningHistory.create({
        data: {
          studentId,
          quizId: submission.quizId,
          lessonId: submission.quiz.lesson.id,
          action: HistoryAction.QUIZ_SUBMITTED,
          score: submission.maxScore > 0
            ? (totalScore / submission.maxScore) * 100
            : 0,
          timeSpent: dto.timeSpent ?? 0,
          topics: Object.keys(topicResults),
        },
      });

      if (!hasEssay) {
        await this.updateStudentProfile(tx, studentId, topicResults, totalScore, submission.maxScore, dto.timeSpent);
      }

      return result;
    });

    if (hasEssay) {
      const course = await this.prisma.course.findUnique({
        where: { id: submission.quiz.lesson.courseId },
        select: { teacherId: true, title: true },
      });

      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { firstName: true, lastName: true },
      });

      if (course?.teacherId && student) {
        await this.notificationsService.create({
          userId: course.teacherId,
          title: 'Bài tự luận mới cần chấm',
          message: `${student.firstName} ${student.lastName} đã nộp bài tự luận trong "${submission.quiz.title}" (${course.title})`,
          type: NotificationType.INFO,
        });
      }
    }

    return updated;
  }

  async gradeEssay(dto: GradeEssayDto, userId: string, role: Role) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: dto.answerId },
      include: {
        question: true,
        submission: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentProfile: { select: { averageScore: true } },
              },
            },
            quiz: {
              include: {
                lesson: { include: { course: true } },
                questions: true,
              },
            },
            answers: { include: { question: true } },
          },
        },
      },
    });

    if (!answer) throw new NotFoundException('Answer not found');
    if (answer.question.type !== QuestionType.ESSAY) {
      throw new BadRequestException('Only essay answers can be manually graded');
    }

    this.assertCanGrade(answer.submission, userId, role);

    const maxPoints = answer.question.points;
    if (dto.pointsEarned > maxPoints) {
      throw new BadRequestException(`Points cannot exceed ${maxPoints}`);
    }

    await this.prisma.answer.update({
      where: { id: dto.answerId },
      data: {
        pointsEarned: dto.pointsEarned,
        isCorrect: dto.pointsEarned >= maxPoints * 0.6,
        feedback: dto.feedback ?? 'Đã chấm bài',
      },
    });

    const updatedAnswers = await this.prisma.answer.findMany({
      where: { submissionId: answer.submission.id },
      include: { question: true },
    });

    const newScore = updatedAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const allGraded = updatedAnswers.every(
      (a) =>
        a.question.type !== QuestionType.ESSAY || a.isCorrect !== null,
    );

    const result = await this.prisma.submission.update({
      where: { id: answer.submission.id },
      data: {
        score: newScore,
        status: allGraded ? SubmissionStatus.GRADED : SubmissionStatus.SUBMITTED,
        gradedAt: allGraded ? new Date() : null,
      },
      include: SUBMISSION_INCLUDE,
    });

    if (allGraded) {
      const topicResults = this.gradingEngine.buildTopicResults(updatedAnswers);
      await this.prisma.$transaction(async (tx) => {
        await this.updateStudentProfile(
          tx,
          answer.submission.studentId,
          topicResults,
          newScore,
          answer.submission.maxScore,
          answer.submission.timeSpent ?? 0,
        );
      });

      const pct =
        answer.submission.maxScore > 0
          ? Math.round((newScore / answer.submission.maxScore) * 100)
          : 0;

      await this.notificationsService.create({
        userId: answer.submission.studentId,
        title: 'Bài kiểm tra đã được chấm',
        message: `Bài "${answer.submission.quiz.title}" đã được chấm. Điểm: ${pct}%`,
        type: NotificationType.SUCCESS,
      });
    }

    return result;
  }

  async suggestEssayGrade(answerId: string, userId: string, role: Role) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: true,
        submission: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                studentProfile: { select: { averageScore: true } },
              },
            },
            quiz: { include: { lesson: { include: { course: true } } } },
          },
        },
      },
    });

    if (!answer) throw new NotFoundException('Answer not found');
    if (answer.question.type !== QuestionType.ESSAY) {
      throw new BadRequestException('Only essay answers can be AI-graded');
    }

    this.assertCanGrade(answer.submission, userId, role);

    return this.gradingEngine.suggestEssayGrade(answer, userId, role);
  }

  async getPendingGradingCount(userId: string, role: Role) {
    const where: Prisma.SubmissionWhereInput = {
      status: SubmissionStatus.SUBMITTED,
      answers: {
        some: {
          question: { type: QuestionType.ESSAY },
          isCorrect: null,
        },
      },
    };

    if (role === Role.TEACHER) {
      where.quiz = { lesson: { course: { teacherId: userId } } };
    }

    return this.prisma.submission.count({ where });
  }

  async findAll(query: SubmissionQueryDto, userId: string, role: Role) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.SubmissionWhereInput = {};

    if (role === Role.STUDENT) {
      where.studentId = userId;
    } else if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.quizId) where.quizId = query.quizId;
    if (query.status) where.status = query.status;

    if (role === Role.TEACHER) {
      where.quiz = {
        lesson: { course: { teacherId: userId } },
      };
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        include: SUBMISSION_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return buildPaginatedResult(submissions, total, page, limit);
  }

  async findOne(id: string, userId: string, role: Role) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: SUBMISSION_INCLUDE,
    });

    if (!submission) throw new NotFoundException('Submission not found');
    await this.assertCanView(submission, userId, role);
    return submission;
  }

  private async getOwnedSubmission(id: string, studentId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: SUBMISSION_INCLUDE,
    });

    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.studentId !== studentId) {
      throw new ForbiddenException('Not your submission');
    }

    return submission;
  }



  private async updateStudentProfile(
    tx: Prisma.TransactionClient,
    studentId: string,
    topicResults: Record<string, { correct: number; total: number }>,
    score: number,
    maxScore: number,
    timeSpent?: number,
  ) {
    const profile = await tx.studentProfile.findUnique({ where: { userId: studentId } });
    if (!profile) return;

    const weak = new Set(profile.weakTopics);
    const strong = new Set(profile.strongTopics);

    for (const [topic, result] of Object.entries(topicResults)) {
      const rate = result.correct / result.total;
      if (rate < 0.5) {
        weak.add(topic);
        strong.delete(topic);
      } else if (rate >= 0.8) {
        strong.add(topic);
        weak.delete(topic);
      }
    }

    const submissions = await tx.submission.findMany({
      where: { studentId, status: SubmissionStatus.GRADED },
      select: { score: true, maxScore: true },
    });

    const avgScore =
      submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0), 0) / submissions.length
        : maxScore > 0 ? (score / maxScore) * 100 : 0;

    await tx.studentProfile.update({
      where: { userId: studentId },
      data: {
        averageScore: avgScore,
        weakTopics: Array.from(weak),
        strongTopics: Array.from(strong),
        totalTimeSpent: profile.totalTimeSpent + Math.floor((timeSpent ?? 0) / 60),
        lastActiveAt: new Date(),
        learningStreak: profile.learningStreak + 1,
      },
    });
  }

  private async assertCanView(
    submission: {
      studentId: string;
      quiz: { lesson: { courseId: string; course?: { teacherId: string } } };
    },
    userId: string,
    role: Role,
  ) {
    if (role === Role.ADMIN) return;
    if (role === Role.STUDENT && submission.studentId === userId) return;

    if (role === Role.TEACHER) {
      const teacherId =
        submission.quiz.lesson.course?.teacherId ??
        (
          await this.prisma.course.findUnique({
            where: { id: submission.quiz.lesson.courseId },
            select: { teacherId: true },
          })
        )?.teacherId;

      if (teacherId === userId) return;
    }

    throw new ForbiddenException('Access denied');
  }

  private assertCanGrade(
    submission: { studentId: string; quiz: { lesson: { course: { teacherId: string } } } },
    userId: string,
    role: Role,
  ) {
    if (role === Role.ADMIN) return;
    if (role === Role.TEACHER && submission.quiz.lesson.course.teacherId === userId) return;
    throw new ForbiddenException('Cannot grade this submission');
  }
}
