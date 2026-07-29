'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, Lock, CheckCircle2, Sparkles, Star, Search, Flame } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BadgeSpec {
  id: string;
  name: string;
  category: 'Onboarding' | 'Consistency' | 'Excellence' | 'Skill' | 'Community' | 'Milestone';
  description: string;
  condition: string;
  xp: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlocked: boolean;
  icon: string;
}

const badgeCollection: BadgeSpec[] = [
  { id: '1', name: 'Khai phá LMS', category: 'Onboarding', description: 'Đăng nhập và hoàn thành bài học đầu tiên', condition: 'Hoàn thành 1 bài học', xp: 50, rarity: 'COMMON', unlocked: true, icon: '🚀' },
  { id: '2', name: 'Học siêu tốc', category: 'Excellence', description: 'Hoàn thành 3 bài học trong cùng 1 ngày', condition: '3 bài học/ngày', xp: 100, rarity: 'COMMON', unlocked: true, icon: '⚡' },
  { id: '3', name: 'Tân binh Quiz', category: 'Excellence', description: 'Hoàn thành bài Quiz đầu tiên', condition: 'Nộp 1 bài Quiz', xp: 50, rarity: 'COMMON', unlocked: true, icon: '🎯' },
  { id: '4', name: 'Điểm tuyệt đối', category: 'Excellence', description: 'Đạt điểm 100% trong 1 bài Quiz', condition: 'Đạt 100% điểm', xp: 150, rarity: 'RARE', unlocked: true, icon: '💯' },
  { id: '5', name: 'Khởi động Streak', category: 'Consistency', description: 'Duy trì chuỗi học 3 ngày liên tục', condition: 'Streak 3 ngày', xp: 100, rarity: 'COMMON', unlocked: true, icon: '🔥' },
  { id: '6', name: 'Chiến binh Tuần', category: 'Consistency', description: 'Duy trì chuỗi học 7 ngày liên tục', condition: 'Streak 7 ngày', xp: 250, rarity: 'RARE', unlocked: false, icon: '🛡️' },
  { id: '7', name: 'Huyền thoại Tháng', category: 'Consistency', description: 'Duy trì chuỗi học 30 ngày liên tục', condition: 'Streak 30 ngày', xp: 1000, rarity: 'LEGENDARY', unlocked: false, icon: '👑' },
  { id: '8', name: 'Cú đêm siêng năng', category: 'Consistency', description: 'Hoàn thành bài học sau 11 giờ đêm', condition: 'Học sau 23:00', xp: 100, rarity: 'RARE', unlocked: true, icon: '🦉' },
  { id: '9', name: 'Bình minh tri thức', category: 'Consistency', description: 'Hoàn thành bài học trước 7 giờ sáng', condition: 'Học trước 07:00', xp: 100, rarity: 'RARE', unlocked: false, icon: '🌅' },
  { id: '10', name: 'Chuyên gia JavaScript', category: 'Skill', description: 'Hoàn thành 100% Module JavaScript ES6+', condition: 'Master JavaScript', xp: 300, rarity: 'RARE', unlocked: true, icon: '💻' },
  { id: '11', name: 'Thần đồng React', category: 'Skill', description: 'Hoàn thành Module React Components', condition: 'Master React', xp: 500, rarity: 'EPIC', unlocked: false, icon: '⚛️' },
  { id: '12', name: 'Vua Quiz', category: 'Excellence', description: 'Hoàn thành 10 bài Quiz đạt điểm >= 90%', condition: '10 Quiz điểm cao', xp: 500, rarity: 'EPIC', unlocked: false, icon: '🏆' },
  { id: '13', name: 'Bình luận tích cực', category: 'Community', description: 'Đăng 5 thảo luận dưới bài học', condition: '5 thảo luận', xp: 100, rarity: 'COMMON', unlocked: true, icon: '💬' },
  { id: '14', name: 'Đồng đội thân thiện', category: 'Community', description: 'Nhận được 10 lượt thả tim từ bạn học', condition: '10 Reactions', xp: 200, rarity: 'RARE', unlocked: false, icon: '❤️' },
  { id: '15', name: 'Tín đồ Video', category: 'Onboarding', description: 'Xem trọn vẹn 5 Video bài giảng YouTube', condition: 'Xem 5 Video', xp: 150, rarity: 'COMMON', unlocked: true, icon: '🎥' },
  { id: '16', name: 'Chuyên gia Nộp bài', category: 'Excellence', description: 'Nộp bài tập kéo thả đúng hạn 5 lần', condition: '5 bài tập đúng hạn', xp: 250, rarity: 'RARE', unlocked: true, icon: '📤' },
  { id: '17', name: 'Bậc thầy AI Prompt', category: 'Skill', description: 'Hỏi Trợ lý AI 10 câu hỏi giải thích', condition: '10 lần dùng AI Assistant', xp: 150, rarity: 'RARE', unlocked: true, icon: '🤖' },
  { id: '18', name: 'Sưu tầm Chứng chỉ', category: 'Milestone', description: 'Nhận chứng chỉ hoàn thành Khóa học đầu tiên', condition: '1 Chứng chỉ', xp: 750, rarity: 'EPIC', unlocked: false, icon: '📜' },
  { id: '19', name: 'CLB 1,000 XP', category: 'Milestone', description: 'Tích lũy đạt mốc 1,000 XP', condition: 'Tích lũy 1,000 XP', xp: 300, rarity: 'RARE', unlocked: true, icon: '💎' },
  { id: '20', name: 'Huyền thoại 5,000 XP', category: 'Milestone', description: 'Tích lũy đạt mốc 5,000 XP', condition: 'Tích lũy 5,000 XP', xp: 1000, rarity: 'LEGENDARY', unlocked: false, icon: '🔮' },
];

const rarityStyles = {
  COMMON: 'border-border bg-card text-foreground',
  RARE: 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  EPIC: 'border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-400',
  LEGENDARY: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [search, setSearch] = useState('');

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: analyticsService.getStudentDashboard,
  });

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const filteredBadges = badgeCollection.filter((b) => {
    if (filter === 'UNLOCKED' && !b.unlocked) return false;
    if (filter === 'LOCKED' && b.unlocked) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unlockedCount = badgeCollection.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bộ sưu tập Thành tích & Huy hiệu"
        description="Mở khóa các danh hiệu cao quý, tích lũy XP và khẳng định năng lực học tập"
        icon={Trophy}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-2xl">
            🏆
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Huy hiệu đã mở khóa</p>
            <p className="text-2xl font-bold text-foreground">
              {unlockedCount} / {badgeCollection.length}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-2xl">
            ⚡
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng điểm thưởng XP</p>
            <p className="text-2xl font-bold text-primary">1,450 XP</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-2xl">
            🔥
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cấp độ hiện tại</p>
            <p className="text-2xl font-bold text-emerald-500">Level 5 Scholar</p>
          </div>
        </GlassCard>
      </div>

      {/* Filter & Search Controls */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            Tất cả ({badgeCollection.length})
          </Button>
          <Button
            variant={filter === 'UNLOCKED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('UNLOCKED')}
          >
            Đã mở khóa ({unlockedCount})
          </Button>
          <Button
            variant={filter === 'LOCKED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('LOCKED')}
          >
            Chưa mở khóa ({badgeCollection.length - unlockedCount})
          </Button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm huy hiệu..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Badges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              'relative rounded-xl border p-5 transition-all duration-200 bg-card flex flex-col justify-between',
              rarityStyles[badge.rarity],
              !badge.unlocked && 'opacity-60 grayscale-[40%]',
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{badge.icon}</span>
                <Badge
                  variant={badge.unlocked ? 'success' : 'outline'}
                  className="text-[9px] uppercase font-bold"
                >
                  {badge.rarity}
                </Badge>
              </div>

              <h4 className="mt-3 font-bold text-sm text-foreground">{badge.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-amber-500 font-bold">+{badge.xp} XP</span>
              {badge.unlocked ? (
                <span className="flex items-center text-emerald-500 font-bold text-[10px]">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Đã mở
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground text-[10px]">
                  <Lock className="mr-1 h-3.5 w-3.5" /> Khóa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
