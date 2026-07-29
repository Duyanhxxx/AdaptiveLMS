'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardCheck, LayoutDashboard, TrendingUp, Users, AlertTriangle, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';

const groupColors: Record<string, string> = {
  EXCELLENT: 'border-emerald-500/40 bg-emerald-500/5',
  AVERAGE: 'border-amber-500/40 bg-amber-500/5',
  NEEDS_SUPPORT: 'border-rose-500/40 bg-rose-500/5',
};

const groupBadge: Record<string, 'success' | 'warning' | 'destructive'> = {
  EXCELLENT: 'success',
  AVERAGE: 'warning',
  NEEDS_SUPPORT: 'destructive',
};

export function TeacherDashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: analyticsService.getTeacherDashboard,
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
        <p className="text-sm font-semibold text-destructive">Không thể tải thông tin Bảng điều khiển Giảng viên.</p>
      </GlassCard>
    );
  }

  const needsSupportGroup = data.studentGroups?.find((g) => g.key === 'NEEDS_SUPPORT');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trung tâm Quản lý Giảng viên"
        description="Giám sát 3 nhóm học viên, xử lý bài tập chờ chấm và hỗ trợ học viên nguy cơ"
        icon={LayoutDashboard}
        action={
          data.summary.pendingGrading > 0 ? (
            <Button asChild className="font-bold shadow-md">
              <Link href="/teacher/grading">
                <ClipboardCheck className="mr-1.5 h-4 w-4" />
                Chấm ngay {data.summary.pendingGrading} bài chờ
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* High Priority Alert: Students at Risk */}
      {needsSupportGroup && needsSupportGroup.students.length > 0 && (
        <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Cảnh báo Học viên Cần hỗ trợ (Students at Risk)
                  </span>
                  <Badge variant="destructive" className="text-[10px]">
                    {needsSupportGroup.count} học viên
                  </Badge>
                </div>
                <p className="text-xs text-foreground font-medium mt-0.5">
                  Có {needsSupportGroup.count} học viên thuộc nhóm nguy cơ (Điểm TB &lt; 50%). Cần giảng viên gửi tài liệu hỗ trợ.
                </p>
              </div>
            </div>
            <Link href="/teacher/student-groups">
              <Button size="sm" variant="outline" className="text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold">
                Xem danh sách nguy cơ
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng số khóa học"
          value={data.summary.totalCourses}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Tổng học viên đăng ký"
          value={data.summary.totalStudents}
          icon={Users}
          color="violet"
        />
        <StatCard
          title="Điểm TB toàn lớp"
          value={`${data.summary.classAverageScore}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Bài tự luận chờ chấm"
          value={data.summary.pendingGrading}
          icon={ClipboardCheck}
          color="amber"
        />
      </div>

      {/* 3 Student Groups Matrix */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h2 className="text-base font-bold text-foreground">Phân loại 3 Nhóm Học viên</h2>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/teacher/student-groups">
              Chi tiết phân nhóm & Thống kê
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {data.studentGroups?.map((group) => (
            <GlassCard
              key={group.key}
              className={`border ${groupColors[group.key]} space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{group.label}</h3>
                  <p className="text-[11px] text-muted-foreground">{group.description}</p>
                </div>
                <Badge variant={groupBadge[group.key]} className="font-bold">
                  {group.count} học viên
                </Badge>
              </div>

              {group.students.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Chưa có học viên nào ở nhóm này</p>
              ) : (
                <div className="space-y-2">
                  {group.students.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-2.5 text-xs"
                    >
                      <span className="font-medium text-foreground truncate">{s.name}</span>
                      <span className="font-bold text-primary">{s.averageScore}%</span>
                    </div>
                  ))}
                  {group.students.length > 5 && (
                    <p className="text-[11px] text-muted-foreground text-center pt-1">
                      +{group.students.length - 5} học viên khác...
                    </p>
                  )}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
