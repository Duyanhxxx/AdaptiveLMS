'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { BookOpen, Shield, TrendingUp, Users } from 'lucide-react';
import type { AdminDashboard } from '@/types';

function isAdminDashboard(data: AdminDashboard | undefined): data is AdminDashboard {
  return !!data && 'summary' in data && 'topStudents' in data;
}

export function AdminDashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: analyticsService.getAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !isAdminDashboard(data)) {
    return <p className="text-destructive">Failed to load admin dashboard.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and learner analytics"
        icon={Shield}
      />

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-semibold">Top Students</h3>
          {data.topStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet</p>
          ) : (
            <div className="space-y-3">
              {data.topStudents.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </div>
                  <Badge variant="success">{s.averageScore}%</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="mb-4 font-semibold">Weak Students</h3>
          {data.weakStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">All students are doing well</p>
          ) : (
            <div className="space-y-3">
              {data.weakStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <Badge variant="destructive">{s.averageScore}%</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
