import { PrismaClient, BadgeCategory } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
  { name: 'Khai phá LMS', description: 'Đăng nhập và hoàn thành bài học đầu tiên.', icon: '🚀', category: BadgeCategory.LEARNING },
  { name: 'Học siêu tốc', description: 'Hoàn thành 3 khóa học trong một tháng.', icon: '⚡', category: BadgeCategory.LEARNING },
  { name: 'Điểm tuyệt đối', description: 'Đạt 100 điểm trong một bài Quiz khó.', icon: '💯', category: BadgeCategory.ACHIEVEMENT },
  { name: 'JS Specialist', description: 'Hoàn thành lộ trình JavaScript nâng cao.', icon: '💻', category: BadgeCategory.ACHIEVEMENT },
  { name: 'Sẻ chia tri thức', description: 'Bình luận giải đáp thắc mắc cho 5 người.', icon: '❤️', category: BadgeCategory.SOCIAL },
  { name: 'Ngọn lửa Đam mê', description: 'Giữ chuỗi học tập 7 ngày liên tiếp.', icon: '🔥', category: BadgeCategory.LEARNING },
  { name: 'Cú đêm', description: 'Học lúc 2h sáng.', icon: '🦉', category: BadgeCategory.SPECIAL },
  { name: 'Nhà thám hiểm', description: 'Xem qua 10 khóa học khác nhau.', icon: '🗺️', category: BadgeCategory.LEARNING },
  { name: 'Chiến thần Quiz', description: 'Làm đúng 50 câu hỏi liên tục.', icon: '⚔️', category: BadgeCategory.ACHIEVEMENT },
  { name: 'Người truyền cảm hứng', description: 'Nhận được 50 lượt thả tim.', icon: '🌟', category: BadgeCategory.SOCIAL },
];

// Add filler badges to reach 40+
for (let i = 11; i <= 40; i++) {
  badges.push({
    name: `Huy hiệu bí ẩn #${i}`,
    description: `Nhiệm vụ ẩn số ${i} cần khám phá.`,
    icon: '❓',
    category: BadgeCategory.SPECIAL,
  });
}

async function main() {
  console.log('Seeding badges...');
  for (const badge of badges) {
    await prisma.badge.create({
      data: badge,
    });
  }
  console.log('Seeding badges complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
