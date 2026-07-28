'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, UserPlus } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { lessonProgressService } from '@/services/lesson-progress.service';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GlassCard } from '@/components/layout/glass-card';

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesService.getById(id),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentsService.listMine,
    enabled: user?.role === 'STUDENT',
  });

  const isEnrolled = enrollments?.some((e) => e.course.id === id);

  const { data: progress } = useQuery({
    queryKey: ['course-progress', id],
    queryFn: () => lessonProgressService.getCourseProgress(id),
    enabled: user?.role === 'STUDENT' && isEnrolled,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollmentsService.enroll(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-enrollments'] }),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!course) return <p className="text-destructive">Course not found</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/courses">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </Button>

      <GlassCard className="overflow-hidden p-0">
        <div className="bg-brand-gradient px-8 py-6">
          <Badge className="mb-3 bg-white/20 text-white">{course.difficulty}</Badge>
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
          {course.teacher && (
            <p className="mt-2 text-sm text-white/80">
              Instructor: {course.teacher.firstName} {course.teacher.lastName}
            </p>
          )}
        </div>
        <div className="p-8">
          <p className="text-muted-foreground">{course.description}</p>
          {user?.role === 'STUDENT' && isEnrolled && progress && (
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">Tiến độ khóa học</span>
                <span>{progress.completedCount}/{progress.totalLessons} bài · {progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
            </div>
          )}
          {user?.role === 'STUDENT' && (
            <div className="mt-6">
              {isEnrolled ? (
                <Badge variant="success">Đã đăng ký</Badge>
              ) : (
                <Button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                >
                  <UserPlus className="h-4 w-4" />
                  {enrollMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký khóa học'}
                </Button>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Lessons</h2>
        </div>
        {!course.lessons?.length ? (
          <GlassCard>
            <p className="text-muted-foreground">No lessons published yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => {
              const lessonProgress = progress?.lessons.find((l) => l.id === lesson.id);
              const completed = lessonProgress?.completed;

              return (
              <GlassCard
                key={lesson.id}
                hover
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${completed ? 'bg-emerald-500' : 'bg-brand-gradient'}`}>
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.duration} min · {lesson.difficulty}
                      {completed && ' · Đã hoàn thành'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={user?.role === 'STUDENT' && !isEnrolled}
                >
                  <Link href={`/courses/${id}/lessons/${lesson.id}`}>
                    {user?.role === 'STUDENT' && !isEnrolled ? 'Đăng ký để học' : 'View'}
                  </Link>
                </Button>
              </GlassCard>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
