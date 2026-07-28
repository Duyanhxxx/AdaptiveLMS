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
import { uniqueSlug } from '../common/utils/slug.util';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const COURSE_INCLUDE = {
  teacher: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  _count: { select: { lessons: true, enrollments: true } },
} satisfies Prisma.CourseInclude;

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  async findAll(query: CourseQueryDto, role: Role) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.CourseWhereInput = {};

    if (!this.courseAccess.canViewUnpublished(role)) {
      where.isPublished = true;
    } else if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.teacherId) where.teacherId = query.teacherId;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: COURSE_INCLUDE,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.course.count({ where }),
    ]);

    return buildPaginatedResult(courses, total, page, limit);
  }

  async findOne(id: string, role: Role) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        ...COURSE_INCLUDE,
        lessons: {
          where: this.courseAccess.canViewUnpublished(role)
            ? undefined
            : { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
            difficulty: true,
            isPublished: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPublished && !this.courseAccess.canViewUnpublished(role)) {
      throw new ForbiddenException('Course is not published');
    }

    return course;
  }

  async create(dto: CreateCourseDto, teacherId: string, role: Role) {
    if (role !== Role.TEACHER && role !== Role.ADMIN) {
      throw new ForbiddenException('Only teachers can create courses');
    }

    const slug = await uniqueSlug(dto.title, async (s) => {
      const existing = await this.prisma.course.findUnique({ where: { slug: s } });
      return !!existing;
    });

    return this.prisma.course.create({
      data: {
        ...dto,
        slug,
        teacherId,
        difficulty: dto.difficulty ?? 'BEGINNER',
      },
      include: COURSE_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateCourseDto, userId: string, role: Role) {
    await this.courseAccess.assertCanManageCourse(id, userId, role);

    const data: Prisma.CourseUpdateInput = { ...dto };

    if (dto.title) {
      data.slug = await uniqueSlug(dto.title, async (s) => {
        const existing = await this.prisma.course.findFirst({
          where: { slug: s, NOT: { id } },
        });
        return !!existing;
      });
    }

    return this.prisma.course.update({
      where: { id },
      data,
      include: COURSE_INCLUDE,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    await this.courseAccess.assertCanManageCourse(id, userId, role);

    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Prisma.CourseOrderByWithRelationInput {
    const allowed: Record<string, Prisma.CourseOrderByWithRelationInput> = {
      title: { title: sortOrder },
      createdAt: { createdAt: sortOrder },
      difficulty: { difficulty: sortOrder },
    };

    return allowed[sortBy ?? ''] ?? { createdAt: sortOrder };
  }
}
