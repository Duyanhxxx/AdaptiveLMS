'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, ClipboardCheck, LayoutDashboard, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';

const groupColors: Record<string, string> = {
  EXCELLENT: 'border-emerald-500/30 bg-emerald-500/5',
  AVERAGE: 'border-amber-500/30 bg-amber-500/5',
  NEEDS_SUPPORT: 'border-rose-500/30 bg-rose-500/5',
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
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive">Failed to load dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teacher Dashboard"
        description="Theo dõi 3 nhóm học viên và chấm bài tự luận"
        icon={LayoutDashboard}
        action={
          data.summary.pendingGrading > 0 ? (
            <Button asChild>
              <Link href="/teacher/grading">
                <ClipboardCheck className="h-4 w-4" />
                Chấm {data.summary.pendingGrading} bài
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Courses"
          value={data.summary.totalCourses}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Students"
          value={data.summary.totalStudents}
          icon={Users}
          color="violet"
        />
        <StatCard
          title="Class Average"
          value={`${data.summary.classAverageScore}%`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Chờ chấm bài"
          value={data.summary.pendingGrading}
          icon={ClipboardCheck}
          color="amber"
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">3 nhóm học viên</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {data.studentGroups?.map((group) => (
            <GlassCard
              key={group.key}
              className={`border-2 ${groupColors[group.key]}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <Badge variant={groupBadge[group.key]}>{group.count}</Badge>
              </div>
              {group.students.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có học viên</p>
              ) : (
                <div className="space-y-2">
                  {group.students.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg bg-card/60 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{s.name}</span>
                      <span className="text-muted-foreground">{s.averageScore}%</span>
                    </div>
                  ))}
                  {group.students.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{group.students.length - 5} học viên khác
                    </p>
                  )}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/teacher/student-groups">
            <Users className="h-4 w-4" />
            Chi tiết 3 nhóm
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/teacher/courses">
            <BookOpen className="h-4 w-4" />
            Quản lý khóa học
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/teacher/grading">
            <ClipboardCheck className="h-4 w-4" />
            Chấm bài tự luận
          </Link>
        </Button>
      </div>
    </div>
  );
}
