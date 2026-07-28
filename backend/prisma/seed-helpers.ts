import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  ALL_TOPICS,
  COURSES,
  FIRST_NAMES,
  LAST_NAMES,
  LESSON_TITLES,
  MCQ_OPTIONS,
  MCQ_TEMPLATES,
  SEED_PASSWORD,
} from './seed-data';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function hashPassword() {
  return bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
}

async function clearDatabase() {
  await prisma.answer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.learningHistory.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers(passwordHash: string) {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@adaptive.edu.vn',
      passwordHash,
      firstName: 'Quản',
      lastName: 'Trị Viên',
      role: 'ADMIN',
    },
  });

  const teachers = await Promise.all(
    COURSES.map((_, i) =>
      prisma.user.create({
        data: {
          email: `teacher${i + 1}@adaptive.edu.vn`,
          passwordHash,
          firstName: pick(FIRST_NAMES),
          lastName: `Giáo viên ${i + 1}`,
          role: 'TEACHER',
        },
      }),
    ),
  );

  const students = await Promise.all(
    LAST_NAMES.slice(0, 50).map((lastName, i) => {
      const slug = `${FIRST_NAMES[i % FIRST_NAMES.length]}.${lastName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '.');
      return prisma.user.create({
        data: {
          email: `${slug}.${i + 1}@student.edu.vn`,
          passwordHash,
          firstName: FIRST_NAMES[i % FIRST_NAMES.length],
          lastName,
          role: 'STUDENT',
          studentProfile: {
            create: {
              learningLevel: pick(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
              averageScore: 0,
              learningStreak: randInt(0, 30),
              totalTimeSpent: randInt(30, 600),
              weakTopics: [],
              strongTopics: [],
              lastActiveAt: daysAgo(randInt(0, 14)),
            },
          },
        },
      });
    }),
  );

  return { admin, teachers, students };
}

async function seedCourses(teachers: { id: string }[]) {
  return Promise.all(
    COURSES.map((course, i) => {
      const { topics: _topics, ...courseData } = course;
      return prisma.course.create({
        data: {
          ...courseData,
          teacherId: teachers[i].id,
          isPublished: true,
        },
      });
    }),
  );
}

async function seedLessons(courses: { id: string }[]) {
  const lessons = [];
  for (let ci = 0; ci < courses.length; ci++) {
    const course = courses[ci];
    const courseTopics = COURSES[ci].topics;
    for (let i = 0; i < 8; i++) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: `${LESSON_TITLES[i]} — ${courseTopics[0]}`,
          content: `# ${LESSON_TITLES[i]}\n\nNội dung bài học về ${courseTopics.join(', ')}. Đây là bài học số ${i + 1} trong khóa học.\n\n## Mục tiêu\n- Hiểu khái niệm cơ bản\n- Thực hành với ví dụ\n- Làm bài tập cuối bài`,
          order: i,
          duration: randInt(20, 60),
          difficulty: pick(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
          topics: [pick(courseTopics), pick(ALL_TOPICS)],
          isPublished: true,
        },
      });
      lessons.push(lesson);
    }
  }
  return lessons;
}

async function seedQuizzes(lessons: { id: string; topics: string[] }[]) {
  const quizLessons = lessons.filter((_, i) => i % 2 === 0).slice(0, 20);
  const quizzes = [];

  for (const lesson of quizLessons) {
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: lesson.id,
        title: `Kiểm tra: ${lesson.topics[0]}`,
        description: 'Bài kiểm tra cuối bài',
        timeLimit: randInt(15, 45),
        passingScore: 60,
      },
    });
    quizzes.push({ ...quiz, topics: lesson.topics });
  }
  return quizzes;
}

async function seedQuestions(quizzes: { id: string; topics: string[] }[]) {
  const questions = [];
  for (const quiz of quizzes) {
    for (let i = 0; i < 10; i++) {
      const topic = pick(quiz.topics);
      const options = pick(MCQ_OPTIONS);
      const type = i < 8 ? 'MULTIPLE_CHOICE' : i === 8 ? 'TRUE_FALSE' : 'ESSAY';
      const question = await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: pick(MCQ_TEMPLATES).replace('{topic}', topic),
          type,
          options: type !== 'ESSAY' ? options : undefined,
          correctAnswer: type === 'ESSAY' ? null : options[0],
          points: type === 'ESSAY' ? 2 : 1,
          order: i,
          topic,
        },
      });
      questions.push(question);
    }
  }
  return questions;
}

export {
  prisma,
  pick,
  randInt,
  daysAgo,
  hashPassword,
  clearDatabase,
  seedUsers,
  seedCourses,
  seedLessons,
  seedQuizzes,
  seedQuestions,
};
