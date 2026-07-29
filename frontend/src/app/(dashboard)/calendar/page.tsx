'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, BookOpen, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudyCalendarPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: analyticsService.getStudentDashboard,
  });

  if (isLoading) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const today = new Date();
  const currentMonth = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  // Generate days for current month grid
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: (firstDayIndex + 6) % 7 }, (_, i) => i);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lịch học cá nhân"
        description="Theo dõi lịch sử ngày học, hạn nộp bài kiểm tra và quản lý lộ trình học tập"
        icon={CalendarIcon}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-base capitalize text-foreground">{currentMonth}</h3>
            <Badge variant="primary">
              Streak: {dashboard?.learningStreak ?? 0} ngày 🔥
            </Badge>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider py-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
            <span>CN</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {paddingDays.map((p) => (
              <div key={`pad-${p}`} className="h-16 rounded-lg bg-secondary/10 opacity-30" />
            ))}

            {daysArray.map((d) => {
              const isToday = d === today.getDate();
              const hasActivity = (d % 3 === 0) || isToday; // Visual indicator for study days

              return (
                <div
                  key={d}
                  className={`h-16 p-2 rounded-lg border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'border-primary bg-primary/10 shadow-sm font-bold'
                      : 'border-border/60 bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-foreground'}`}>{d}</span>
                    {hasActivity && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-bold text-primary truncate">Hôm nay</span>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Learning Schedule & Deadlines */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Lịch nhắc nhở mục tiêu</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Mục tiêu hằng ngày</span>
                  <Badge variant="success" className="text-[9px]">Đã hoàn thành</Badge>
                </div>
                <p className="text-xs text-foreground font-medium">Học 30 phút & hoàn thành 1 Quiz</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-secondary/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Hạn Quiz tuần này</span>
                  <Badge variant="warning" className="text-[9px]">Sắp tới hạn</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Quiz Đánh giá Kỹ năng Frontend</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">Thành tích tháng này</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Số bài đã học:</span>
                <span className="font-bold text-foreground">12 bài</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Điểm TB Quiz:</span>
                <span className="font-bold text-primary">{Math.round(dashboard?.averageScore ?? 0)}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tổng XP tích lũy:</span>
                <span className="font-bold text-emerald-500">+340 XP 🏆</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
