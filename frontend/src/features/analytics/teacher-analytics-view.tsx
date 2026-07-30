'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, BookOpen, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function TeacherAnalyticsView() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Phân tích Lớp học (Analytics)" description="Đang tải dữ liệu..." icon={BarChart3} />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Phân tích Lớp học (Analytics)"
        description="Tổng quan năng lực và tiến độ học tập của toàn bộ sinh viên"
        icon={BarChart3}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tổng Sinh viên</p>
            <p className="text-2xl font-bold">{dashboard?.summary?.totalStudents || 0}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Điểm Trung bình</p>
            <p className="text-2xl font-bold">{dashboard?.summary?.classAverageScore || 0}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Khóa học đang dạy</p>
            <p className="text-2xl font-bold">{dashboard?.summary?.totalCourses || 0}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Chờ chấm điểm</p>
            <p className="text-2xl font-bold">{dashboard?.summary?.pendingGrading || 0}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Students */}
        <GlassCard className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" /> Học viên Tiêu biểu
          </h3>
          <div className="space-y-4">
            {dashboard?.topStudents?.map((student: any, i: number) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <Link href={`/teacher/students/${student.id}`} className="font-semibold text-sm hover:underline">
                      {student.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{student.averageScore} đ</p>
                  <Badge variant="outline" className="text-[10px] mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {student.learningLevel}
                  </Badge>
                </div>
              </div>
            ))}
            {dashboard?.topStudents?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu học viên.</p>
            )}
          </div>
        </GlassCard>

        {/* At Risk Students */}
        <GlassCard className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-500" /> Sinh viên Cần chú ý (Dưới 50đ)
          </h3>
          <div className="space-y-4">
            {dashboard?.weakStudents?.map((student: any) => (
              <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-600 font-bold text-xs">
                    !
                  </div>
                  <div>
                    <Link href={`/teacher/students/${student.id}`} className="font-semibold text-sm hover:underline">
                      {student.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-500">{student.averageScore} đ</p>
                </div>
              </div>
            ))}
            {dashboard?.weakStudents?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tuyệt vời, không có học viên nào dưới trung bình!</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
