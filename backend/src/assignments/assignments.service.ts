import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssignmentDto, teacherId: string, role: Role) {
    // Check if lesson exists and belongs to the teacher
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (role !== Role.ADMIN && lesson.course.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot add assignment to this lesson');
    }

    return this.prisma.assignment.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        maxScore: dto.maxScore ?? 100,
      },
    });
  }

  async findAllByLesson(lessonId: string) {
    return this.prisma.assignment.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingSubmissions(teacherId: string, role: Role) {
    const whereClause: any = {
      score: null,
    };

    if (role === Role.TEACHER) {
      whereClause.assignment = {
        lesson: {
          course: {
            teacherId,
          },
        },
      };
    }

    return this.prisma.assignmentSubmission.findMany({
      where: whereClause,
      include: {
        assignment: { select: { title: true, maxScore: true, id: true } },
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async gradeSubmission(
    submissionId: string,
    dto: GradeAssignmentDto,
    teacherId: string,
    role: Role,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (
      role !== Role.ADMIN &&
      submission.assignment.lesson.course.teacherId !== teacherId
    ) {
      throw new ForbiddenException('Cannot grade this submission');
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
      },
    });
  }
}

