import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CourseAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseOrThrow(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async assertCanManageCourse(
    courseId: string,
    userId: string,
    role: Role,
  ) {
    if (role === Role.ADMIN) {
      return this.getCourseOrThrow(courseId);
    }

    const course = await this.getCourseOrThrow(courseId);

    if (course.teacherId !== userId) {
      throw new ForbiddenException('You do not own this course');
    }

    return course;
  }

  canViewUnpublished(role: Role): boolean {
    return role === Role.ADMIN || role === Role.TEACHER;
  }
}
