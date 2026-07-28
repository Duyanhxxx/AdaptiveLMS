'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { lessonsService } from '@/services/lessons.service';
import { lessonProgressService } from '@/services/lesson-progress.service';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { QuizTaker } from '@/features/student/quiz-taker';

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsService.getById(lessonId),
  });

  const { data: courseProgress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => lessonProgressService.getCourseProgress(courseId),
    enabled: user?.role === 'STUDENT',
  });

  useEffect(() => {
    const lessonDone = courseProgress?.lessons.find((l) => l.id === lessonId)?.completed;
    if (lessonDone) setCompleted(true);
  }, [courseProgress, lessonId]);

  useEffect(() => {
    if (user?.role === 'STUDENT' && lesson) {
      lessonProgressService.markViewed(lessonId, 0).catch(() => {});
    }
  }, [user, lesson, lessonId]);

  const handleComplete = async () => {
    await lessonProgressService.markCompleted(lessonId, 0);
    setCompleted(true);
    queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!lesson) return <p className="text-destructive">Lesson not found</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/courses/${courseId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>
      </Button>

      <GlassCard className="overflow-hidden p-0">
        <div className="bg-brand-gradient px-8 py-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge className="bg-white/20 text-white">{lesson.difficulty}</Badge>
            {lesson.topics.map((topic) => (
              <Badge key={topic} className="bg-white/10 text-white">
                {topic}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
            <Clock className="h-4 w-4" />
            {lesson.duration} minutes
          </p>
        </div>
        <article className="p-8">
          <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {lesson.content}
          </div>
          {user?.role === 'STUDENT' && (
            <Button className="mt-6" onClick={handleComplete} disabled={completed}>
              <CheckCircle className="h-4 w-4" />
              {completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </Button>
          )}
        </article>
      </GlassCard>

      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Bài kiểm tra</h2>
          {!activeQuiz ? (
            <div className="space-y-3">
              {lesson.quizzes.map((quiz) => (
                <GlassCard key={quiz.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz._count?.questions ?? 0} câu · Đạt {quiz.passingScore}%
                    </p>
                  </div>
                  {user?.role === 'STUDENT' ? (
                    <Button size="sm" onClick={() => setActiveQuiz(quiz.id)}>
                      Làm bài
                    </Button>
                  ) : (
                    <Badge variant="outline">Quiz</Badge>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)}>
                Quay lại danh sách quiz
              </Button>
              <QuizTaker quizId={activeQuiz} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
