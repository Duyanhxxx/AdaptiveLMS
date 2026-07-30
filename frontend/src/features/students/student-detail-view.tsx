'use client';

import { useQuery } from '@tanstack/react-query';
import { User, Award, BookOpen, Clock, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function StudentDetailView({ studentId }: { studentId: string }) {
  const router = useRouter();
  
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-detail', studentId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/student/${studentId}/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch student details');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Hồ sơ Học viên" description="Đang tải dữ liệu..." icon={User} />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6 text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Không tìm thấy thông tin học viên</h2>
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <PageHeader
          title={dashboard.student.name}
          description={`Chi tiết năng lực và lịch sử học tập`}
          icon={User}
        />
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>

      {/* Main Profile Info */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
            {dashboard.student.name.charAt(0)}
          </div>
          <div className="flex-1 grid gap-4 md:grid-cols-4 w-full">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Điểm Trung bình</p>
              <p className="text-2xl font-bold text-primary">{dashboard.averageScore} đ</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiến độ Khóa học</p>
              <p className="text-2xl font-bold text-emerald-500">{dashboard.progress.completionPercent}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thời gian học</p>
              <p className="text-2xl font-bold text-amber-500">{Math.round(dashboard.totalTimeSpent / 60)}h</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chuỗi học liên tục</p>
              <p className="text-2xl font-bold text-rose-500">{dashboard.learningStreak} ngày</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Knowledge Profiling */}
        <GlassCard className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Phân tích Năng lực
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Điểm mạnh (Strong Topics)</p>
              <div className="flex flex-wrap gap-2">
                {dashboard.strongTopics?.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {topic}
                  </Badge>
                ))}
                {!dashboard.strongTopics?.length && <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Cần cải thiện (Weak Topics)</p>
              <div className="flex flex-wrap gap-2">
                {dashboard.weakTopics?.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                    {topic}
                  </Badge>
                ))}
                {!dashboard.weakTopics?.length && <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Hoạt động gần đây
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {dashboard.recentActivity?.map((act: any, i: number) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0">
                <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /></div>
                <div>
                  <p className="text-sm font-medium">{act.action}</p>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    {act.score !== null && <span>Điểm: <strong className="text-primary">{act.score}</strong></span>}
                    <span>{new Date(act.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            ))}
            {dashboard.recentActivity?.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
