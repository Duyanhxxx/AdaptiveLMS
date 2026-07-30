import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResult,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  studentProfile: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createByAdmin(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role,
        },
        select: USER_SELECT,
      });

      if (dto.role === Role.STUDENT) {
        await tx.studentProfile.create({
          data: { userId: created.id },
        });
      }

      return created;
    });
  }

  async findAll(query: UserQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResult(users, total, page, limit);
  }

  async findStudents(query: UserQueryDto) {
    return this.findAll({ ...query, role: Role.STUDENT });
  }

  async findOne(id: string, requesterId: string, requesterRole: Role) {
    this.assertCanView(id, requesterId, requesterRole);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requesterId: string,
    requesterRole: Role,
  ) {
    this.assertCanModify(id, requesterId, requesterRole, dto);

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.TEACHER) {
      // Fetch teacher specific stats
      const courses = await this.prisma.course.findMany({
        where: { teacherId: userId },
        include: {
          _count: { select: { enrollments: true, lessons: true } },
        },
      });

      const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
      const totalCourses = courses.length;
      const publishedCourses = courses.filter((c) => c.isPublished).length;
      
      const teacherStats = {
        totalStudents,
        totalCourses,
        publishedCourses,
        draftCourses: totalCourses - publishedCourses,
        courses,
      };

      return { ...user, teacherStats };
    }

    // Default to student profile logic
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            thumbnailUrl: true,
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const history = await this.prisma.learningHistory.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        lesson: { select: { title: true } },
        quiz: { select: { title: true } },
      },
    });

    return { ...user, enrollments, history };
  }

  private assertCanView(id: string, requesterId: string, role: Role) {
    if (role === Role.ADMIN || role === Role.TEACHER) return;
    if (id !== requesterId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private assertCanModify(
    id: string,
    requesterId: string,
    role: Role,
    dto: UpdateUserDto,
  ) {
    if (role === Role.ADMIN) return;

    if (id !== requesterId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (dto.isActive !== undefined) {
      throw new ForbiddenException('Cannot change account status');
    }
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Prisma.UserOrderByWithRelationInput {
    const allowed: Record<string, Prisma.UserOrderByWithRelationInput> = {
      email: { email: sortOrder },
      firstName: { firstName: sortOrder },
      lastName: { lastName: sortOrder },
      createdAt: { createdAt: sortOrder },
      role: { role: sortOrder },
    };

    return allowed[sortBy ?? ''] ?? { createdAt: sortOrder };
  }
}
