import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(courseId: string, studentId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, isPublished: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPublished) {
      throw new ForbiddenException('Course is not published');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        progress: 0,
      },
      include: {
        course: {
          select: { id: true, title: true, slug: true, difficulty: true },
        },
      },
    });
  }

  async listMine(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            isPublished: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async listForStudent(studentId: string, requesterRole: Role) {
    // Admin/Teacher can inspect enrollments of any student.
    if (requesterRole === Role.STUDENT) {
      throw new BadRequestException('Access denied');
    }

    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: { id: true, title: true, slug: true, difficulty: true },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }
}

