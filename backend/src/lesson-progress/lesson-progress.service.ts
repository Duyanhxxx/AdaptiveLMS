import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { HistoryAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LessonProgressDto } from './dto/lesson-progress.dto';

@Injectable()
export class LessonProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async markViewed(
    lessonId: string,
    studentId: string,
    dto: LessonProgressDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!lesson.isPublished || !lesson.course?.isPublished) {
      throw new ForbiddenException('Lesson is not available');
    }

    // Auto-enroll on first view for smoother UX.
    await this.ensureEnrollment(lesson.courseId, studentId);

    return this.prisma.learningHistory.create({
      data: {
        studentId,
        lessonId,
        action: HistoryAction.LESSON_VIEWED,
        timeSpent: dto.timeSpentSeconds ?? 0,
        topics: lesson.topics,
      },
    });
  }

  async markCompleted(
    lessonId: string,
    studentId: string,
    dto: LessonProgressDto,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (!lesson.isPublished || !lesson.course?.isPublished) {
      throw new ForbiddenException('Lesson is not available');
    }

    await this.ensureEnrollment(lesson.courseId, studentId);

    const existingCompletion = await this.prisma.learningHistory.findFirst({
      where: {
        studentId,
        lessonId,
        action: HistoryAction.LESSON_COMPLETED,
      },
    });

    const isNewCompletion = !existingCompletion;

    if (existingCompletion) {
      return this.prisma.$transaction(async (tx) => {
        await tx.learningHistory.update({
          where: { id: existingCompletion.id },
          data: {
            timeSpent: Math.max(
              existingCompletion.timeSpent ?? 0,
              dto.timeSpentSeconds ?? 0,
            ),
            topics: lesson.topics,
          },
        });

        const progress = await this.calculateCourseProgress(
          tx,
          lesson.courseId,
          studentId,
        );

        await tx.enrollment.update({
          where: {
            studentId_courseId: { studentId, courseId: lesson.courseId },
          },
          data: { progress },
        });

        // Keep streak consistent: only increment when completion is new.
        if (!isNewCompletion) {
          await tx.studentProfile.update({
            where: { userId: studentId },
            data: {
              lastActiveAt: new Date(),
              totalTimeSpent:
                (await tx.studentProfile.findUnique({ where: { userId: studentId }, select: { totalTimeSpent: true } }))
                  ?.totalTimeSpent! +
                Math.floor((dto.timeSpentSeconds ?? 0) / 60),
            },
          });
        }

        return { progress };
      });
    }

    const created = await this.prisma.learningHistory.create({
      data: {
        studentId,
        lessonId,
        action: HistoryAction.LESSON_COMPLETED,
        timeSpent: dto.timeSpentSeconds ?? 0,
        topics: lesson.topics,
      },
      select: { id: true },
    });

    const progress = await this.calculateCourseProgress(
      this.prisma,
      lesson.courseId,
      studentId,
    );

    await this.prisma.enrollment.update({
      where: {
        studentId_courseId: { studentId, courseId: lesson.courseId },
      },
      data: { progress },
    });

    // Update profile totals with a second query to avoid overcomplicated math.
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { totalTimeSpent: true, learningStreak: true },
    });

    await this.prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        totalTimeSpent:
          (profile?.totalTimeSpent ?? 0) +
          Math.floor((dto.timeSpentSeconds ?? 0) / 60),
        learningStreak: (profile?.learningStreak ?? 0) + 1,
      },
    });

    return { id: created.id, progress };
  }

  async getCourseProgress(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const publishedLessons = await this.prisma.lesson.findMany({
      where: { courseId, isPublished: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, order: true },
    });

    const completedHistories = await this.prisma.learningHistory.findMany({
      where: {
        studentId,
        lessonId: { in: publishedLessons.map((l) => l.id) },
        action: HistoryAction.LESSON_COMPLETED,
      },
      select: { lessonId: true },
    });

    const completedSet = new Set(completedHistories.map((h) => h.lessonId));

    return {
      courseId,
      progress: enrollment?.progress ?? 0,
      totalLessons: publishedLessons.length,
      completedCount: completedSet.size,
      lessons: publishedLessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        completed: completedSet.has(l.id),
      })),
    };
  }

  private async ensureEnrollment(courseId: string, studentId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      select: { id: true },
    });

    if (existing) return;

    await this.prisma.enrollment.create({
      data: { studentId, courseId, progress: 0 },
    });
  }

  private async calculateCourseProgress(
    tx: any,
    courseId: string,
    studentId: string,
  ) {
    const publishedLessons = await tx.lesson.findMany({
      where: { courseId, isPublished: true },
      select: { id: true },
    });

    const total = publishedLessons.length;
    if (total === 0) return 0;

    const lessonIds = publishedLessons.map(
      (l: { id: string }) => l.id,
    );
    const completed = await tx.learningHistory.count({
      where: {
        studentId,
        lessonId: { in: lessonIds },
        action: HistoryAction.LESSON_COMPLETED,
      },
    });

    return Math.round((completed / total) * 100);
  }
}

