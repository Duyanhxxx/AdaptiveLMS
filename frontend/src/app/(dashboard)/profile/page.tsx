'use client';

import { useQuery } from '@tanstack/react-query';
import { UserCircle, Trophy, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { usersService } from '@/services/users.service';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  return `${Math.floor(diffInMonths / 12)} năm trước`;
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: usersService.getMyProfile,
  });

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-2xl" />;
  }

  if (!profile) return <p className="text-destructive">Không tìm thấy thông tin</p>;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Xem tổng quan điểm số, tiến độ học tập và các hoạt động gần đây của bạn"
        icon={UserCircle}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Card */}
        <GlassCard className="col-span-1 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-4xl font-bold text-white shadow-xl shadow-indigo-500/20">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <h2 className="mt-4 text-xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge className="mt-2" variant="outline">
              {profile.role}
            </Badge>
          </div>

          {profile.studentProfile && (
            <div className="space-y-4 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                  <Trophy className="mr-2 h-4 w-4" /> Điểm trung bình
                </span>
                <span className="font-bold text-primary">
                  {Math.round(profile.studentProfile.averageScore)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                  <Activity className="mr-2 h-4 w-4" /> Chuỗi học tập
                </span>
                <span className="font-bold text-primary">
                  {profile.studentProfile.learningStreak} ngày
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-sm font-medium text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" /> Thời gian học
                </span>
                <span className="font-bold text-primary">
                  {Math.round(profile.studentProfile.totalTimeSpent / 60)} giờ
                </span>
              </div>

              {profile.studentProfile.strongTopics?.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-muted-foreground">Thế mạnh:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {profile.studentProfile.strongTopics.map((topic: string) => (
                      <Badge key={topic} variant="success" className="text-[10px]">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        <div className="col-span-1 space-y-6 md:col-span-2">
          {/* Enrolled Courses */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Khóa học đã đăng ký</h3>
            </div>
            
            {profile.enrollments?.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Bạn chưa đăng ký khóa học nào.
              </p>
            ) : (
              <div className="space-y-4">
                {profile.enrollments?.map((e: any) => {
                  const progressPct = e.progress ? Math.round(e.progress) : 0;

                  return (
                    <div key={e.id} className="rounded-xl border border-border/40 bg-secondary/20 p-4 transition-colors hover:bg-secondary/40">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{e.course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Khóa học có {e.course._count.lessons} bài học
                          </p>
                        </div>
                        <Badge variant={progressPct === 100 ? 'success' : 'default'}>
                          {progressPct}%
                        </Badge>
                      </div>
                      <Progress value={progressPct} className="mt-3 h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Activity Timeline */}
          <GlassCard>
            <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Lịch sử hoạt động gần đây</h3>
            </div>

            {profile.history?.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Chưa có hoạt động học tập nào.
              </p>
            ) : (
              <div className="relative space-y-0 pl-4 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[2px] before:bg-border/60">
                {profile.history?.map((h: any, i: number) => (
                  <div key={h.id} className="relative pb-6 pl-6 last:pb-0">
                    <div className="absolute left-[-21px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
                    <p className="text-sm font-medium">
                      {h.action === 'LESSON_VIEWED' && 'Đã xem bài học'}
                      {h.action === 'LESSON_COMPLETED' && 'Hoàn thành bài học'}
                      {h.action === 'QUIZ_STARTED' && 'Bắt đầu làm quiz'}
                      {h.action === 'QUIZ_SUBMITTED' && `Nộp quiz (Điểm: ${h.score ? Math.round(h.score) : 0}%)`}
                    </p>
                    <p className="text-sm text-foreground">
                      {h.action.includes('QUIZ') ? h.quiz?.title : h.lesson?.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {timeAgo(h.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
