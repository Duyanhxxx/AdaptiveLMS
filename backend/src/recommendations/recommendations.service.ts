import { Injectable, NotFoundException } from '@nestjs/common';
import { LearningLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  classifyStudentGroup,
  getGroupMeta,
} from '../common/utils/student-group.util';
import {
  buildPaginatedResult,
  getPaginationParams,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generate(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!user?.studentProfile) {
      throw new NotFoundException('Student profile not found');
    }

    const profile = user.studentProfile;

    const [recentHistory, availableLessons, latestSubmission] =
      await Promise.all([
        this.prisma.learningHistory.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
        this.prisma.lesson.findMany({
          where: { isPublished: true, course: { isPublished: true } },
          select: {
            id: true,
            title: true,
            difficulty: true,
            topics: true,
          },
          take: 20,
        }),
        this.prisma.submission.findFirst({
          where: { studentId },
          orderBy: { submittedAt: 'desc' },
          select: { score: true, maxScore: true },
        }),
      ]);

    const currentScore =
      latestSubmission && latestSubmission.maxScore > 0
        ? (latestSubmission.score / latestSubmission.maxScore) * 100
        : profile.averageScore;

    const studentGroup = classifyStudentGroup(profile.averageScore);

    const aiResult = await this.aiService.generateRecommendation({
      studentName: `${user.firstName} ${user.lastName}`,
      currentScore,
      averageScore: profile.averageScore,
      studentGroup,
      weakTopics: profile.weakTopics,
      strongTopics: profile.strongTopics,
      timeSpentMinutes: profile.totalTimeSpent,
      recentHistory: recentHistory.map((h) => ({
        action: h.action,
        score: h.score ?? undefined,
        topics: h.topics,
        date: h.createdAt.toISOString(),
      })),
      availableLessons,
    });

    const recommendation = await this.prisma.$transaction(async (tx) => {
      await tx.studentProfile.update({
        where: { userId: studentId },
        data: { learningLevel: aiResult.learningLevel as LearningLevel },
      });

      return tx.recommendation.create({
        data: {
          studentId,
          learningLevel: aiResult.learningLevel as LearningLevel,
          strengths: aiResult.strengths,
          weaknesses: aiResult.weaknesses,
          recommendedLessonIds: aiResult.recommendedLessonIds,
          practicePlan: aiResult.practicePlan,
          motivationalFeedback: aiResult.motivationalFeedback,
          explanation: aiResult.explanation,
        },
      });
    });

    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: recommendation.recommendedLessonIds } },
      select: {
        id: true,
        title: true,
        difficulty: true,
        duration: true,
        topics: true,
        courseId: true,
      },
    });

    return {
      ...recommendation,
      studentGroup,
      groupStrategy: aiResult.groupStrategy,
      recommendedLessons: lessons,
    };
  }

  async getLatest(studentId: string) {
    const recommendation = await this.prisma.recommendation.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    if (!recommendation) {
      return { message: 'No recommendations yet. Generate one first.' };
    }

    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { averageScore: true },
    });

    const studentGroup = classifyStudentGroup(profile?.averageScore ?? 0);

    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: recommendation.recommendedLessonIds } },
      select: {
        id: true,
        title: true,
        difficulty: true,
        duration: true,
        topics: true,
        courseId: true,
      },
    });

    return {
      ...recommendation,
      studentGroup,
      groupStrategy: getGroupMeta(studentGroup).description,
      recommendedLessons: lessons,
    };
  }

  async findAll(studentId: string, query: PaginationQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);

    const [recommendations, total] = await Promise.all([
      this.prisma.recommendation.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.recommendation.count({ where: { studentId } }),
    ]);

    return buildPaginatedResult(recommendations, total, page, limit);
  }
}
