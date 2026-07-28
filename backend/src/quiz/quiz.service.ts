import {
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
import { QuizQueryDto } from './dto/quiz-query.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

const QUIZ_INCLUDE = {
  lesson: {
    select: {
      id: true,
      title: true,
      courseId: true,
      course: { select: { id: true, title: true, teacherId: true } },
    },
  },
  _count: { select: { questions: true, submissions: true } },
} satisfies Prisma.QuizInclude;

@Injectable()
export class QuizService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  async findAll(query: QuizQueryDto) {
    const { page, limit, skip } = getPaginationParams(query);
    const where: Prisma.QuizWhereInput = {};

    if (query.lessonId) where.lessonId = query.lessonId;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildQuizOrderBy(query.sortBy, query.sortOrder);

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        include: QUIZ_INCLUDE,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return buildPaginatedResult(quizzes, total, page, limit);
  }

  async findOne(id: string, includeAnswers = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        ...QUIZ_INCLUDE,
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            points: true,
            order: true,
            topic: true,
            ...(includeAnswers ? { correctAnswer: true } : {}),
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async create(dto: CreateQuizDto, userId: string, role: Role) {
    const lesson = await this.getLessonOrThrow(dto.lessonId);
    await this.courseAccess.assertCanManageCourse(
      lesson.courseId,
      userId,
      role,
    );

    return this.prisma.quiz.create({
      data: {
        ...dto,
        passingScore: dto.passingScore ?? 60,
      },
      include: QUIZ_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateQuizDto, userId: string, role: Role) {
    const quiz = await this.getQuizWithCourse(id);
    await this.assertQuizAccess(quiz, userId, role);

    return this.prisma.quiz.update({
      where: { id },
      data: dto,
      include: QUIZ_INCLUDE,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const quiz = await this.getQuizWithCourse(id);
    await this.assertQuizAccess(quiz, userId, role);

    await this.prisma.quiz.delete({ where: { id } });
    return { message: 'Quiz deleted successfully' };
  }

  async addQuestion(
    quizId: string,
    dto: CreateQuestionDto,
    userId: string,
    role: Role,
  ) {
    const quiz = await this.getQuizWithCourse(quizId);
    await this.assertQuizAccess(quiz, userId, role);

    const order =
      dto.order ??
      (await this.prisma.question.count({ where: { quizId } }));

    return this.prisma.question.create({
      data: {
        ...dto,
        quizId,
        order,
        options: dto.options ?? undefined,
        type: dto.type ?? 'MULTIPLE_CHOICE',
        points: dto.points ?? 1,
      },
    });
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
    userId: string,
    role: Role,
  ) {
    const question = await this.getQuestionWithCourse(questionId);
    await this.assertQuizAccess(question.quiz, userId, role);

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        ...dto,
        options: dto.options ?? undefined,
      },
    });
  }

  async removeQuestion(questionId: string, userId: string, role: Role) {
    const question = await this.getQuestionWithCourse(questionId);
    await this.assertQuizAccess(question.quiz, userId, role);

    await this.prisma.question.delete({ where: { id: questionId } });
    return { message: 'Question deleted successfully' };
  }

  private async getLessonOrThrow(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  private async getQuizWithCourse(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: { select: { courseId: true, course: { select: { teacherId: true } } } },
      },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  private async getQuestionWithCourse(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            lesson: { select: { courseId: true, course: { select: { teacherId: true } } } },
          },
        },
      },
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  private async assertQuizAccess(
    quiz: { lesson: { courseId: string } },
    userId: string,
    role: Role,
  ) {
    await this.courseAccess.assertCanManageCourse(
      quiz.lesson.courseId,
      userId,
      role,
    );
  }

  private buildQuizOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Prisma.QuizOrderByWithRelationInput {
    const allowed: Record<string, Prisma.QuizOrderByWithRelationInput> = {
      title: { title: sortOrder },
      createdAt: { createdAt: sortOrder },
      passingScore: { passingScore: sortOrder },
    };

    return allowed[sortBy ?? ''] ?? { createdAt: sortOrder };
  }
}
