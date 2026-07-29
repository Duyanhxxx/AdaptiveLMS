import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Teacher Profiles...');

  // Find all teachers
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
  });

  if (teachers.length === 0) {
    console.log('No teachers found to seed profiles for. Please create a teacher user first.');
    return;
  }

  for (const teacher of teachers) {
    // Check if profile already exists
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { userId: teacher.id },
    });

    if (!existingProfile) {
      await prisma.teacherProfile.create({
        data: {
          userId: teacher.id,
          bio: 'Tôi là một kỹ sư phần mềm với hơn 10 năm kinh nghiệm trong việc phát triển hệ thống và giảng dạy công nghệ. Sứ mệnh của tôi là giúp học viên nắm bắt kiến thức thực tiễn tốt nhất.',
          specialization: 'Senior Software Architect',
          teachingExperience: 8,
          expertise: ['React', 'Node.js', 'System Design', 'TypeScript', 'AWS'],
          education: 'Thạc sĩ Khoa học Máy tính - Đại học Công nghệ',
          certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Developer'],
          followers: 1250,
          averageRating: 4.8,
          totalReviews: 320,
        },
      });
      console.log(`Created TeacherProfile for ${teacher.email}`);
    } else {
      console.log(`TeacherProfile already exists for ${teacher.email}`);
    }
  }

  console.log('Teacher Profiles seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
