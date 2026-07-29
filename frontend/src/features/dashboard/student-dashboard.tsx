'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, Flame, Target, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { WeeklyChart } from '@/components/charts/weekly-chart';
import { TopicList } from '@/components/charts/topic-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { formatPercent } from '@/lib/utils';

function getStudentGroupLabel(score: number) {
  if (score >= 80) return { label: 'Nhóm xuất sắc', variant: 'success' as const };
  if (score >= 50) return { label: 'Nhóm trung bình', variant: 'warning' as const };
  return { label: 'Nhóm cần hỗ trợ', variant: 'destructive' as const };
}

export function StudentDashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: analyticsService.getStudentDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-8 text-center border-destructive/20 bg-destructive/5">
        <p className="text-sm font-semibold text-destructive">Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.</p>
      </GlassCard>
    );
  }

  const group = getStudentGroupLabel(data.averageScore);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Xin chào, ${data.student.name}!`}
        description="Tổng quan tiến độ học tập, điểm số và gợi ý bài học cá nhân hóa"
        icon={Target}
        action={
          <div className="flex gap-2">
            <Badge variant="outline" className="font-semibold">{data.learningLevel}</Badge>
            <Badge variant={group.variant}>{group.label}</Badge>
          </div>
        }
      />

      {/* Recommended Lesson AI Banner */}
      {data.recommendedLesson && (
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-[10px]">
                  <Sparkles className="mr-1 h-3 w-3" /> AI Đề xuất bài học tiếp theo
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">{data.recommendedLesson.title}</h3>
              <p className="text-xs text-muted-foreground">
                Thời lượng: {data.recommendedLesson.duration} phút · Độ khó: {data.recommendedLesson.difficulty}
              </p>
            </div>
            <Link href={data.recommendedLesson.courseId ? `/courses/${data.recommendedLesson.courseId}/lessons/${data.recommendedLesson.id}` : '/courses'}>
              <Button className="font-bold shadow-md">
                Học ngay bài này
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Điểm trung bình"
          value={`${Math.round(data.averageScore)}%`}
          icon={Award}
          color="violet"
        />
        <StatCard
          title="Chuỗi ngày học (Streak)"
          value={`${data.learningStreak} ngày 🔥`}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={formatPercent(data.progress.completionPercent)}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Tổng bài nộp"
          value={data.totalSubmissions}
          icon={BookOpen}
          color="indigo"
        />
      </div>

      {/* Performance Chart & Course Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h3 className="font-bold text-sm text-foreground">Hiệu suất học tập hàng tuần</h3>
            <Badge variant="outline" className="text-[10px]">Recent Activity</Badge>
          </div>
          <WeeklyChart data={data.weeklyPerformance} />
        </GlassCard>

        {data.progress.courses.length > 0 && (
          <GlassCard>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="font-bold text-sm text-foreground">Tiến độ khóa học của tôi</h3>
              <Badge variant="outline" className="text-[10px]">{data.progress.courses.length} Khóa học</Badge>
            </div>
            <div className="space-y-4">
              {data.progress.courses.map((course) => (
                <div key={course.id} className="space-y-1.5 rounded-lg border border-border/50 p-3 bg-secondary/20">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{course.title}</span>
                    <span className="text-primary font-bold">{formatPercent(course.progress)}</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Strong & Weak Topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopicList
          title="Chủ đề thế mạnh"
          topics={data.strongTopics}
          variant="success"
          emptyText="Hoàn thành thêm quiz để hệ thống nhận diện điểm mạnh của bạn"
        />
        <TopicList
          title="Chủ đề cần cải thiện"
          topics={data.weakTopics}
          variant="destructive"
          emptyText="Tuyệt vời! Chưa có chủ đề yếu nào bị cảnh báo"
        />
      </div>
    </div>
  );
}
