'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, BookOpen, Flame, Target } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { WeeklyChart } from '@/components/charts/weekly-chart';
import { TopicList } from '@/components/charts/topic-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-destructive">Failed to load dashboard. Please try again.</p>
    );
  }

  const group = getStudentGroupLabel(data.averageScore);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Xin chào, ${data.student.name}!`}
        description="Theo dõi tiến độ học tập và khám phá điểm mạnh của bạn"
        icon={Target}
        action={
          <div className="flex gap-2">
            <Badge variant="outline">{data.learningLevel}</Badge>
            <Badge variant={group.variant}>{group.label}</Badge>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Score"
          value={`${data.averageScore}%`}
          icon={Award}
          color="violet"
        />
        <StatCard
          title="Learning Streak"
          value={`${data.learningStreak} days`}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Completion"
          value={formatPercent(data.progress.completionPercent)}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Submissions"
          value={data.totalSubmissions}
          icon={BookOpen}
          color="indigo"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 font-semibold">Weekly Performance</h3>
          <WeeklyChart data={data.weeklyPerformance} />
        </GlassCard>

        {data.recommendedLesson && (
          <GlassCard className="bg-brand-gradient text-white">
            <p className="text-sm font-medium text-white/70">Recommended Lesson</p>
            <p className="mt-2 text-xl font-bold">{data.recommendedLesson.title}</p>
            <p className="mt-2 text-sm text-white/80">
              {data.recommendedLesson.duration} min · {data.recommendedLesson.difficulty}
            </p>
          </GlassCard>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicList
          title="Strong Topics"
          topics={data.strongTopics}
          variant="success"
          emptyText="Complete quizzes to discover your strengths"
        />
        <TopicList
          title="Weak Topics"
          topics={data.weakTopics}
          variant="destructive"
          emptyText="No weak topics identified yet"
        />
      </div>

      {data.progress.courses.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 font-semibold">Course Progress</h3>
          <div className="space-y-5">
            {data.progress.courses.map((course) => (
              <div key={course.id}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium">{course.title}</span>
                  <span className="text-muted-foreground">
                    {formatPercent(course.progress)}
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
