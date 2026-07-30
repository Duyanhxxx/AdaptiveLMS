import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  classifyStudentGroup,
  STUDENT_GROUPS,
} from '../common/utils/student-group.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentDashboard(studentId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    const [enrollments, submissions, history, latestRecommendation] =
      await Promise.all([
        this.prisma.enrollment.findMany({
          where: { studentId },
          include: { course: { select: { id: true, title: true } } },
        }),
        this.prisma.submission.findMany({
          where: { studentId, status: SubmissionStatus.GRADED },
          select: { score: true, maxScore: true, submittedAt: true },
          orderBy: { submittedAt: 'desc' },
        }),
        this.prisma.learningHistory.findMany({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        this.prisma.recommendation.findFirst({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const completionPercent =
      enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
        : 0;

    const weeklyPerformance = this.buildWeeklyPerformance(submissions);

    let recommendedLesson = null;
    if (latestRecommendation?.recommendedLessonIds.length) {
      recommendedLesson = await this.prisma.lesson.findFirst({
        where: { id: latestRecommendation.recommendedLessonIds[0] },
        select: { id: true, title: true, duration: true, difficulty: true },
      });
    }

    return {
      student: {
        id: studentId,
        name: `${profile.user.firstName} ${profile.user.lastName}`,
      },
      progress: {
        completionPercent: Math.round(completionPercent),
        enrolledCourses: enrollments.length,
        courses: enrollments.map((e) => ({
          id: e.course.id,
          title: e.course.title,
          progress: e.progress,
        })),
      },
      averageScore: Math.round(profile.averageScore * 10) / 10,
      learningStreak: profile.learningStreak,
      totalTimeSpent: profile.totalTimeSpent,
      weakTopics: profile.weakTopics,
      strongTopics: profile.strongTopics,
      learningLevel: profile.learningLevel,
      recommendedLesson,
      weeklyPerformance,
      recentActivity: history.slice(0, 10).map((h) => ({
        action: h.action,
        score: h.score,
        topics: h.topics,
        timeSpent: h.timeSpent,
        date: h.createdAt,
      })),
      totalSubmissions: submissions.length,
    };
  }

  async getTeacherDashboard(teacherId: string) {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c) => c.id);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: { select: { averageScore: true, learningLevel: true } },
          },
        },
      },
    });

    const studentMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      averageScore: number;
      learningLevel: string;
      coursesEnrolled: number;
    }>();

    for (const e of enrollments) {
      const existing = studentMap.get(e.studentId);
      if (existing) {
        existing.coursesEnrolled++;
      } else {
        studentMap.set(e.studentId, {
          id: e.student.id,
          name: `${e.student.firstName} ${e.student.lastName}`,
          email: e.student.email,
          averageScore: e.student.studentProfile?.averageScore ?? 0,
          learningLevel: e.student.studentProfile?.learningLevel ?? 'BEGINNER',
          coursesEnrolled: 1,
        });
      }
    }

    const students = Array.from(studentMap.values());
    const sorted = [...students].sort((a, b) => b.averageScore - a.averageScore);

    const classAverage =
      students.length > 0
        ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
        : 0;

    const studentGroups = STUDENT_GROUPS.map((group) => ({
      ...group,
      students: students
        .filter((s) => classifyStudentGroup(s.averageScore) === group.key)
        .map((s) => ({ ...s, group: group.key })),
      count: students.filter(
        (s) => classifyStudentGroup(s.averageScore) === group.key,
      ).length,
    }));

    const pendingGrading = await this.prisma.submission.count({
      where: {
        status: SubmissionStatus.SUBMITTED,
        quiz: { lesson: { courseId: { in: courseIds } } },
      },
    });

    return {
      summary: {
        totalCourses: courses.length,
        totalStudents: students.length,
        classAverageScore: Math.round(classAverage * 10) / 10,
        pendingGrading,
      },
      courses,
      studentGroups,
      topStudents: sorted.slice(0, 5),
      weakStudents: sorted.filter((s) => s.averageScore < 50).slice(0, 5),
      allStudents: sorted,
    };
  }

  async getTeacherStudentGroups(teacherId: string) {
    const courses = await this.prisma.course.findMany({
      where: { teacherId },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c) => c.id);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        course: { select: { id: true, title: true } },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            studentProfile: {
              select: {
                averageScore: true,
                learningLevel: true,
                learningStreak: true,
                weakTopics: true,
                strongTopics: true,
                totalTimeSpent: true,
                lastActiveAt: true,
              },
            },
          },
        },
      },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    const submissions = await this.prisma.submission.findMany({
      where: {
        studentId: { in: studentIds },
        status: { in: [SubmissionStatus.GRADED, SubmissionStatus.SUBMITTED] },
        quiz: { lesson: { courseId: { in: courseIds } } },
      },
      select: {
        id: true,
        studentId: true,
        score: true,
        maxScore: true,
        status: true,
        submittedAt: true,
        quiz: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const studentMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        averageScore: number;
        learningLevel: string;
        learningStreak: number;
        weakTopics: string[];
        strongTopics: string[];
        totalTimeSpent: number;
        lastActiveAt: Date | null;
        courses: Array<{ id: string; title: string; progress: number }>;
        recentSubmissions: Array<{
          id: string;
          quizTitle: string;
          score: number;
          maxScore: number;
          percentage: number;
          status: string;
          submittedAt: Date | null;
        }>;
      }
    >();

    for (const e of enrollments) {
      const profile = e.student.studentProfile;
      const existing = studentMap.get(e.studentId);

      const courseEntry = {
        id: e.course.id,
        title: e.course.title,
        progress: e.progress,
      };

      if (existing) {
        existing.courses.push(courseEntry);
      } else {
        const studentSubs = submissions
          .filter((s) => s.studentId === e.studentId)
          .slice(0, 5)
          .map((s) => ({
            id: s.id,
            quizTitle: s.quiz.title,
            score: s.score,
            maxScore: s.maxScore,
            percentage:
              s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0,
            status: s.status,
            submittedAt: s.submittedAt,
          }));

        studentMap.set(e.studentId, {
          id: e.student.id,
          name: `${e.student.firstName} ${e.student.lastName}`,
          email: e.student.email,
          averageScore: Math.round((profile?.averageScore ?? 0) * 10) / 10,
          learningLevel: profile?.learningLevel ?? 'BEGINNER',
          learningStreak: profile?.learningStreak ?? 0,
          weakTopics: profile?.weakTopics ?? [],
          strongTopics: profile?.strongTopics ?? [],
          totalTimeSpent: profile?.totalTimeSpent ?? 0,
          lastActiveAt: profile?.lastActiveAt ?? null,
          courses: [courseEntry],
          recentSubmissions: studentSubs,
        });
      }
    }

    const students = Array.from(studentMap.values());

    const groups = STUDENT_GROUPS.map((group) => ({
      ...group,
      count: students.filter(
        (s) => classifyStudentGroup(s.averageScore) === group.key,
      ).length,
      students: students
        .filter((s) => classifyStudentGroup(s.averageScore) === group.key)
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((s) => ({
          ...s,
          group: group.key,
        })),
    }));

    return {
      summary: {
        totalStudents: students.length,
        classAverageScore:
          students.length > 0
            ? Math.round(
                (students.reduce((sum, s) => sum + s.averageScore, 0) /
                  students.length) *
                  10,
              ) / 10
            : 0,
      },
      groups,
    };
  }

  async getLearningProgress(studentId: string) {
    const history = await this.prisma.learningHistory.findMany({
      where: { studentId },
      orderBy: { createdAt: 'asc' },
    });

    const topicStats: Record<string, { attempts: number; totalScore: number }> = {};

    for (const h of history) {
      if (h.score !== null) {
        for (const topic of h.topics) {
          if (!topicStats[topic]) topicStats[topic] = { attempts: 0, totalScore: 0 };
          topicStats[topic].attempts++;
          topicStats[topic].totalScore += h.score;
        }
      }
    }

    return {
      totalActivities: history.length,
      topicBreakdown: Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        attempts: stats.attempts,
        averageScore: Math.round((stats.totalScore / stats.attempts) * 10) / 10,
      })),
    };
  }

  async getAdminDashboard() {
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalQuizSubmissions,
      avgAgg,
      topProfiles,
      weakProfiles,
      topCoursesRaw,
      teachersRaw,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.TEACHER } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.enrollment.count(),
      this.prisma.submission.count(),
      this.prisma.studentProfile.aggregate({
        _avg: { averageScore: true },
      }),
      this.prisma.studentProfile.findMany({
        orderBy: { averageScore: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.studentProfile.findMany({
        where: { averageScore: { lt: 50 } },
        orderBy: { averageScore: 'asc' },
        take: 5,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.course.findMany({
        take: 5,
        include: {
          teacher: { select: { firstName: true, lastName: true } },
          _count: { select: { enrollments: true, lessons: true } },
        },
        orderBy: { enrollments: { _count: 'desc' } },
      }),
      this.prisma.user.findMany({
        where: { role: Role.TEACHER },
        take: 5,
        include: {
          coursesTeaching: { select: { id: true, _count: { select: { enrollments: true } } } },
        },
      }),
    ]);

    const classAverageScore = Math.round(((avgAgg._avg.averageScore ?? 0) * 10)) / 10;

    // Mock revenue based on enrollment numbers ($49 per course enrollment)
    const estimatedRevenue = totalEnrollments * 49;
    const monthlyRevenue = Math.round(estimatedRevenue * 0.35);

    // Format Top Courses
    const topCourses = topCoursesRaw.map((c) => ({
      id: c.id,
      title: c.title,
      teacherName: `${c.teacher.firstName} ${c.teacher.lastName}`,
      studentsCount: c._count.enrollments,
      lessonsCount: c._count.lessons,
      rating: 4.8,
    }));

    // Format Top Teachers
    const topTeachers = teachersRaw.map((t) => {
      const totalStudentsTaught = t.coursesTeaching.reduce(
        (sum, c) => sum + c._count.enrollments,
        0,
      );
      return {
        id: t.id,
        name: `${t.firstName} ${t.lastName}`,
        email: t.email,
        coursesCount: t.coursesTeaching.length,
        totalStudents: totalStudentsTaught,
        rating: 4.9,
      };
    });

    // Mock System Health & Operational Metrics
    const systemHealth = {
      status: 'OPERATIONAL',
      uptime: '99.98%',
      cpuUsage: '18%',
      memoryUsage: '42%',
      dbConnections: 12,
      apiLatencyMs: 38,
      activeUsers24h: Math.round((totalStudents + totalTeachers) * 0.65) || 12,
      storageUsedGb: 14.2,
      storageMaxGb: 100,
    };

    const aiUsage = {
      totalRequests: totalQuizSubmissions * 4 + totalStudents * 10 + 120,
      totalTokens: (totalQuizSubmissions * 4 + totalStudents * 10 + 120) * 450,
      estimatedCostUsd: Math.round(((totalQuizSubmissions * 4 + totalStudents * 10 + 120) * 0.002) * 100) / 100,
      aiGenerateQuizCount: totalQuizSubmissions,
    };

    const qualityMetrics = {
      completionRate: totalEnrollments > 0 ? 68.5 : 0,
      dropoutRate: totalStudents > 0 ? Math.round((weakProfiles.length / totalStudents) * 100) : 0,
      avgQuizScore: classAverageScore,
    };

    const systemLogs = [
      { id: '1', event: 'User Login', user: 'teacher@adaptivelms.com', role: 'TEACHER', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), status: 'SUCCESS' },
      { id: '2', event: 'AI Quiz Generation', user: 'teacher@adaptivelms.com', role: 'TEACHER', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), status: 'SUCCESS' },
      { id: '3', event: 'Course Published', user: 'admin@adaptivelms.com', role: 'ADMIN', timestamp: new Date(Date.now() - 42 * 60000).toISOString(), status: 'SUCCESS' },
      { id: '4', event: 'Student Submission', user: 'student@adaptivelms.com', role: 'STUDENT', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), status: 'SUCCESS' },
      { id: '5', event: 'Database Backup', user: 'SYSTEM', role: 'SYSTEM', timestamp: new Date(Date.now() - 360 * 60000).toISOString(), status: 'SUCCESS' },
    ];

    return {
      summary: {
        totalCourses,
        publishedCourses,
        totalStudents,
        totalTeachers,
        totalAdmins,
        totalUsers: totalStudents + totalTeachers + totalAdmins,
        classAverageScore,
        estimatedRevenue,
        monthlyRevenue,
      },
      systemHealth,
      aiUsage,
      qualityMetrics,
      topStudents: topProfiles.map((p) => ({
        id: p.user.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        averageScore: Math.round(p.averageScore * 10) / 10,
        learningLevel: p.learningLevel,
      })),
      weakStudents: weakProfiles.map((p) => ({
        id: p.user.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        averageScore: Math.round(p.averageScore * 10) / 10,
      })),
      topCourses,
      topTeachers,
      systemLogs,
    };
  }

  private buildWeeklyPerformance(
    submissions: Array<{ score: number; maxScore: number; submittedAt: Date | null }>,
  ) {
    const weeks: Array<{ week: string; averageScore: number; count: number }> = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const label = `Week ${4 - i}`;
      const weekSubs = submissions.filter(
        (s) => s.submittedAt && s.submittedAt >= weekStart && s.submittedAt < weekEnd,
      );

      const avg =
        weekSubs.length > 0
          ? weekSubs.reduce((sum, s) => sum + (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0), 0) / weekSubs.length
          : 0;

      weeks.push({
        week: label,
        averageScore: Math.round(avg * 10) / 10,
        count: weekSubs.length,
      });
    }

    return weeks;
  }
}
