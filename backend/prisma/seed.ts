import {
  HistoryAction,
  LearningLevel,
  SubmissionStatus,
} from '@prisma/client';
import {
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
} from './seed-helpers';
import { ALL_TOPICS, SEED_PASSWORD } from './seed-data';

function studentTier(index: number): 'excellent' | 'weak' | 'average' {
  if (index < 10) return 'excellent';
  if (index < 20) return 'weak';
  return 'average';
}

function scoreForTier(tier: 'excellent' | 'weak' | 'average') {
  if (tier === 'excellent') return randInt(85, 100);
  if (tier === 'weak') return randInt(20, 49);
  return randInt(50, 84);
}

async function seedEnrollments(
  students: { id: string }[],
  courses: { id: string }[],
) {
  const enrollments = [];
  for (const student of students) {
    const courseCount = randInt(1, 3);
    const shuffled = [...courses].sort(() => Math.random() - 0.5).slice(0, courseCount);
    for (const course of shuffled) {
      enrollments.push(
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            progress: randInt(10, 100),
            enrolledAt: daysAgo(randInt(7, 90)),
          },
        }),
      );
    }
  }
  return enrollments;
}

async function seedSubmissions(
  students: { id: string }[],
  quizzes: { id: string }[],
  questions: { id: string; quizId: string; correctAnswer: string | null; points: number; type: string }[],
) {
  let count = 0;
  const target = 500;

  while (count < target) {
    const student = pick(students);
    const quiz = pick(quizzes);
    const quizQuestions = questions.filter((q) => q.quizId === quiz.id);
    if (!quizQuestions.length) continue;

    const studentIndex = students.findIndex((s) => s.id === student.id);
    const tier = studentTier(studentIndex);
    const targetScore = scoreForTier(tier);
    const maxScore = quizQuestions.reduce((s, q) => s + q.points, 0);
    const score = Math.round((targetScore / 100) * maxScore);

    const submittedAt = daysAgo(randInt(0, 60));

    const submission = await prisma.submission.create({
      data: {
        studentId: student.id,
        quizId: quiz.id,
        score,
        maxScore,
        status: SubmissionStatus.GRADED,
        timeSpent: randInt(300, 2400),
        submittedAt,
        gradedAt: submittedAt,
      },
    });

    for (const q of quizQuestions) {
      const isCorrect = q.type !== 'ESSAY' && Math.random() < targetScore / 100;
      await prisma.answer.create({
        data: {
          submissionId: submission.id,
          questionId: q.id,
          answerText: isCorrect ? (q.correctAnswer ?? '') : 'Wrong answer',
          isCorrect: q.type === 'ESSAY' ? null : isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
          feedback: isCorrect ? 'Correct!' : 'Incorrect',
        },
      });
    }

    count++;
  }
}

async function updateStudentProfiles(students: { id: string }[]) {
  for (let i = 0; i < students.length; i++) {
    const tier = studentTier(i);
    const subs = await prisma.submission.findMany({
      where: { studentId: students[i].id, status: 'GRADED' },
      select: { score: true, maxScore: true },
    });

    const avg =
      subs.length > 0
        ? subs.reduce((s, sub) => s + (sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0), 0) / subs.length
        : scoreForTier(tier);

    const weakCount = tier === 'weak' ? randInt(2, 4) : tier === 'average' ? randInt(1, 2) : 0;
    const strongCount = tier === 'excellent' ? randInt(2, 4) : tier === 'average' ? randInt(1, 2) : 0;

    const shuffled = [...ALL_TOPICS].sort(() => Math.random() - 0.5);

    await prisma.studentProfile.update({
      where: { userId: students[i].id },
      data: {
        averageScore: Math.round(avg * 10) / 10,
        learningLevel: avg >= 85 ? LearningLevel.EXPERT : avg >= 70 ? LearningLevel.ADVANCED : avg >= 50 ? LearningLevel.INTERMEDIATE : LearningLevel.BEGINNER,
        weakTopics: shuffled.slice(0, weakCount),
        strongTopics: shuffled.slice(weakCount, weakCount + strongCount),
      },
    });
  }
}

async function seedLearningHistory(
  students: { id: string }[],
  lessons: { id: string; topics: string[] }[],
  quizzes: { id: string }[],
) {
  for (const student of students) {
    const eventCount = randInt(5, 15);
    for (let i = 0; i < eventCount; i++) {
      const action = pick([
        HistoryAction.LESSON_VIEWED,
        HistoryAction.LESSON_COMPLETED,
        HistoryAction.QUIZ_STARTED,
        HistoryAction.QUIZ_SUBMITTED,
      ]);
      const lesson = pick(lessons);
      await prisma.learningHistory.create({
        data: {
          studentId: student.id,
          lessonId: lesson.id,
          quizId: action.includes('QUIZ') ? pick(quizzes).id : null,
          action,
          score: action === HistoryAction.QUIZ_SUBMITTED ? randInt(30, 100) : null,
          timeSpent: randInt(60, 1800),
          topics: lesson.topics,
          createdAt: daysAgo(randInt(0, 90)),
        },
      });
    }
  }
}

async function seedRecommendations(
  students: { id: string }[],
  lessons: { id: string }[],
) {
  let count = 0;
  while (count < 100) {
    const student = pick(students);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: student.id } });
    if (!profile) continue;

    const recommendedIds = [...lessons]
      .sort(() => Math.random() - 0.5)
      .slice(0, randInt(2, 4))
      .map((l) => l.id);

    await prisma.recommendation.create({
      data: {
        studentId: student.id,
        learningLevel: profile.learningLevel,
        strengths: profile.strongTopics,
        weaknesses: profile.weakTopics.length ? profile.weakTopics : ['Cần luyện tập thêm'],
        recommendedLessonIds: recommendedIds,
        practicePlan: {
          daily: ['Ôn tập 20 phút', 'Làm 5 câu hỏi luyện tập'],
          weekly: ['Hoàn thành 2 bài học', 'Tham gia 1 bài kiểm tra'],
          focusAreas: profile.weakTopics.slice(0, 3),
        },
        motivationalFeedback: `Bạn đang học tốt với điểm trung bình ${profile.averageScore.toFixed(0)}%. Hãy tiếp tục phát huy!`,
        explanation: `Dựa trên điểm trung bình ${profile.averageScore.toFixed(0)}% và lịch sử học tập, hệ thống đề xuất ${recommendedIds.length} bài học phù hợp để cải thiện kỹ năng.`,
        createdAt: daysAgo(randInt(0, 30)),
      },
    });
    count++;
  }
}

async function seedNotifications(students: { id: string }[]) {
  for (const student of students.slice(0, 20)) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: 'Bài học mới được đề xuất',
        message: 'Hệ thống AI đã tạo lộ trình học tập mới dành cho bạn. Xem ngay!',
        type: 'RECOMMENDATION',
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding database...');
  const passwordHash = await hashPassword();

  await clearDatabase();
  console.log('  ✓ Cleared existing data');

  const { admin, teachers, students } = await seedUsers(passwordHash);
  console.log(`  ✓ Users: 1 admin, ${teachers.length} teachers, ${students.length} students`);

  const courses = await seedCourses(teachers);
  console.log(`  ✓ Courses: ${courses.length}`);

  const lessons = await seedLessons(courses);
  console.log(`  ✓ Lessons: ${lessons.length}`);

  const quizzes = await seedQuizzes(lessons);
  console.log(`  ✓ Quizzes: ${quizzes.length}`);

  const questions = await seedQuestions(quizzes);
  console.log(`  ✓ Questions: ${questions.length}`);

  await seedEnrollments(students, courses);
  console.log('  ✓ Enrollments created');

  await seedSubmissions(students, quizzes, questions);
  console.log('  ✓ Submissions: 500');

  await updateStudentProfiles(students);
  console.log('  ✓ Student profiles updated');

  await seedLearningHistory(students, lessons, quizzes);
  console.log('  ✓ Learning history created');

  await seedRecommendations(students, lessons);
  console.log('  ✓ Recommendations: 100');

  await seedNotifications(students);
  console.log('  ✓ Notifications created');

  console.log('\n✅ Seed completed!');
  console.log('\n📋 Default credentials (all users):');
  console.log(`   Password: ${SEED_PASSWORD}`);
  console.log(`   Admin:    admin@adaptive.edu.vn`);
  console.log(`   Teacher:  teacher1@adaptive.edu.vn`);
  console.log(`   Student:  nguyen.van.an.1@student.edu.vn`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
