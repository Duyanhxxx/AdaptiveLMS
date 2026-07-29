import { PrismaClient, Role, QuestionType, SubmissionStatus, HistoryAction, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding discussions...');

  // Find a teacher and a student
  const teacher = await prisma.user.findFirst({ where: { role: Role.TEACHER } });
  const student = await prisma.user.findFirst({ where: { role: Role.STUDENT } });

  if (!teacher || !student) {
    console.log('Missing teacher or student in DB');
    return;
  }

  // Find a lesson taught by this teacher
  const lesson = await prisma.lesson.findFirst({
    where: { course: { teacherId: teacher.id } }
  });

  if (!lesson) {
    console.log('No lesson found for teacher');
    return;
  }

  // Check if comment already exists
  const existing = await prisma.comment.findFirst({
    where: { lessonId: lesson.id, userId: student.id }
  });

  if (!existing) {
    // Create a mock question from student
    await prisma.comment.create({
      data: {
        lessonId: lesson.id,
        userId: student.id,
        content: 'Thầy/Cô ơi, phần kiến thức này em chưa hiểu rõ, thầy có thể giải thích thêm về cách áp dụng trong thực tế được không ạ?',
      }
    });
    console.log('Created sample discussion question');
  } else {
    console.log('Sample discussion already exists');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
