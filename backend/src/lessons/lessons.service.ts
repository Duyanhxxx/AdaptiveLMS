import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CourseAccessService } from '../common/services/course-access.service';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import { LessonQueryDto } from './dto/lesson-query.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';

const LESSON_INCLUDE = {
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
      teacherId: true,
      isPublished: true,
    },
  },
  _count: { select: { quizzes: true } },
} satisfies Prisma.LessonInclude;

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  async findAll(query: LessonQueryDto, role: Role) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.LessonWhereInput = {};

    if (query.courseId) where.courseId = query.courseId;
    if (query.difficulty) where.difficulty = query.difficulty;

    if (!this.courseAccess.canViewUnpublished(role)) {
      where.isPublished = true;
      where.course = { isPublished: true };
    } else if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);

    const [lessons, total] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        include: LESSON_INCLUDE,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return buildPaginatedResult(lessons, total, page, limit);
  }

  async findOne(id: string, role: Role) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        ...LESSON_INCLUDE,
        quizzes: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (!this.courseAccess.canViewUnpublished(role)) {
      if (!lesson.isPublished || !lesson.course.isPublished) {
        throw new ForbiddenException('Lesson is not available');
      }
    }

    return lesson;
  }

  async create(dto: CreateLessonDto, userId: string, role: Role) {
    await this.courseAccess.assertCanManageCourse(dto.courseId, userId, role);

    const order =
      dto.order ??
      (await this.prisma.lesson.count({ where: { courseId: dto.courseId } }));

    return this.prisma.lesson.create({
      data: {
        ...dto,
        order,
        difficulty: dto.difficulty ?? 'BEGINNER',
        topics: dto.topics ?? [],
      },
      include: LESSON_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateLessonDto, userId: string, role: Role) {
    const lesson = await this.getLessonOrThrow(id);
    await this.courseAccess.assertCanManageCourse(
      lesson.courseId,
      userId,
      role,
    );

    return this.prisma.lesson.update({
      where: { id },
      data: dto,
      include: LESSON_INCLUDE,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const lesson = await this.getLessonOrThrow(id);
    await this.courseAccess.assertCanManageCourse(
      lesson.courseId,
      userId,
      role,
    );

    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted successfully' };
  }

  async reorder(dto: ReorderLessonsDto, userId: string, role: Role) {
    await this.courseAccess.assertCanManageCourse(dto.courseId, userId, role);

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId: dto.courseId },
      select: { id: true },
    });

    const validIds = new Set(lessons.map((l) => l.id));
    if (!dto.lessonIds.every((id) => validIds.has(id))) {
      throw new NotFoundException('One or more lessons not found in this course');
    }

    await this.prisma.$transaction(
      dto.lessonIds.map((id, index) =>
        this.prisma.lesson.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.lesson.findMany({
      where: { courseId: dto.courseId },
      orderBy: { order: 'asc' },
      include: LESSON_INCLUDE,
    });
  }

  private async getLessonOrThrow(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Prisma.LessonOrderByWithRelationInput {
    const allowed: Record<string, Prisma.LessonOrderByWithRelationInput> = {
      title: { title: sortOrder },
      order: { order: sortOrder },
      createdAt: { createdAt: sortOrder },
      duration: { duration: sortOrder },
    };

    return allowed[sortBy ?? ''] ?? { order: 'asc' };
  }
}
