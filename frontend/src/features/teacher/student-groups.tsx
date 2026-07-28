'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import type { StudentGroupsDetail } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const groupStyles: Record<string, { border: string; badge: 'success' | 'warning' | 'destructive' }> = {
  EXCELLENT: { border: 'border-emerald-500/40', badge: 'success' },
  AVERAGE: { border: 'border-amber-500/40', badge: 'warning' },
  NEEDS_SUPPORT: { border: 'border-rose-500/40', badge: 'destructive' },
};

export function StudentGroupsView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-groups-detail'],
    queryFn: analyticsService.getStudentGroups,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive">Không tải được dữ liệu nhóm học viên.</p>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chi tiết 3 nhóm học viên"
        description={`${data.summary.totalStudents} học viên · Điểm TB lớp: ${data.summary.classAverageScore}%`}
        icon={Users}
      />

      <div className="space-y-6">
        {data.groups.map((group) => (
          <GroupSection key={group.key} group={group} />
        ))}
      </div>
    </div>
  );
}

function GroupSection({
  group,
}: {
  group: StudentGroupsDetail['groups'][number];
}) {
  const style = groupStyles[group.key];
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <GlassCard className={cn('border-2', style.border)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{group.label}</h2>
            <Badge variant={style.badge}>{group.count} học viên</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
          <p className="text-xs text-muted-foreground">
            Điểm: {group.minScore}% – {group.maxScore}%
          </p>
        </div>
      </div>

      {group.students.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có học viên trong nhóm này.</p>
      ) : (
        <div className="space-y-2">
          {group.students.map((student) => (
            <div key={student.id} className="rounded-xl border border-border/60 bg-card/60">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() =>
                  setExpanded(expanded === student.id ? null : student.id)
                }
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold">{student.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">{student.learningLevel}</p>
                  </div>
                  {expanded === student.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expanded === student.id && (
                <div className="border-t border-border/60 px-4 py-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Stat label="Streak" value={`${student.learningStreak} ngày`} />
                    <Stat label="Thời gian học" value={`${student.totalTimeSpent} phút`} />
                    <Stat
                      label="Hoạt động cuối"
                      value={
                        student.lastActiveAt
                          ? new Date(student.lastActiveAt).toLocaleDateString('vi-VN')
                          : '—'
                      }
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-emerald-600">Điểm mạnh</p>
                      <div className="flex flex-wrap gap-1">
                        {student.strongTopics.length ? (
                          student.strongTopics.map((t) => (
                            <Badge key={t} variant="success">{t}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa xác định</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-rose-600">Cần cải thiện</p>
                      <div className="flex flex-wrap gap-1">
                        {student.weakTopics.length ? (
                          student.weakTopics.map((t) => (
                            <Badge key={t} variant="destructive">{t}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa xác định</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Tiến độ khóa học</p>
                    {student.courses.map((c) => (
                      <div key={c.id} className="mb-2">
                        <div className="mb-1 flex justify-between text-xs">
                          <span>{c.title}</span>
                          <span>{c.progress}%</span>
                        </div>
                        <Progress value={c.progress} className="h-1.5" />
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Bài kiểm tra gần đây</p>
                    {student.recentSubmissions.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Chưa có bài nộp</p>
                    ) : (
                      <div className="space-y-2">
                        {student.recentSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm"
                          >
                            <span>{sub.quizTitle}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{sub.percentage}%</span>
                              <Badge
                                variant={
                                  sub.status === 'GRADED' ? 'success' : 'warning'
                                }
                                className="text-xs"
                              >
                                {sub.status === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
