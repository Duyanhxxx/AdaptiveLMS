'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, FileText, Video } from 'lucide-react';
import { lessonsService } from '@/services/lessons.service';
import { lessonProgressService } from '@/services/lesson-progress.service';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { QuizTaker } from '@/features/student/quiz-taker';
import { AiLessonAssistant } from '@/features/student/ai-lesson-assistant';

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

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

  if (isLoading) return <Skeleton className="h-[500px] w-full rounded-xl" />;
  if (!lesson) return <p className="text-destructive font-semibold">Không tìm thấy bài học này</p>;

  const embedUrl = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/courses/${courseId}`}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Quay lại danh sách bài học
        </Link>
      </Button>

      {/* Hero Banner */}
      <GlassCard className="overflow-hidden p-0 border-primary/20">
        <div className="bg-brand-gradient px-8 py-8 text-white">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 text-white font-bold">{lesson.difficulty}</Badge>
            {lesson.topics.map((topic) => (
              <Badge key={topic} className="bg-white/10 text-white">
                {topic}
              </Badge>
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{lesson.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-xs text-white/80 font-medium">
            <Clock className="h-3.5 w-3.5" />
            Thời lượng dự kiến: {lesson.duration} phút
          </p>
        </div>

        {/* Embedded YouTube Player if available */}
        {embedUrl && (
          <div className="p-6 bg-black/90 border-b border-border">
            <div className="flex items-center gap-2 text-xs text-white/80 mb-3 font-semibold">
              <Video className="h-4 w-4 text-red-500" />
              <span>Video Bài giảng YouTube</span>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-2xl border border-white/10">
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <article className="p-8">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground text-sm font-normal">
            {lesson.content}
          </div>
          {user?.role === 'STUDENT' && (
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <Button
                size="lg"
                className={`font-bold shadow-md ${completed ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                onClick={handleComplete}
                disabled={completed}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {completed ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành (+10 XP)'}
              </Button>
            </div>
          )}
        </article>
      </GlassCard>

      {/* Quiz Section */}
      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Bài kiểm tra & Quiz của bài học</h2>
          </div>
          {!activeQuiz ? (
            <div className="grid gap-3">
              {lesson.quizzes.map((quiz) => (
                <GlassCard key={quiz.id} className="flex items-center justify-between p-5 hover:border-primary/40 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-foreground">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quiz._count?.questions ?? 0} câu hỏi · Yêu cầu điểm đạt: {quiz.passingScore}%
                    </p>
                  </div>
                  {user?.role === 'STUDENT' ? (
                    <Button size="sm" className="font-semibold" onClick={() => setActiveQuiz(quiz.id)}>
                      Bắt đầu làm Quiz
                    </Button>
                  ) : (
                    <Badge variant="outline">Quiz Preview</Badge>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)}>
                ← Quay lại danh sách Quiz
              </Button>
              <QuizTaker quizId={activeQuiz} />
            </div>
          )}
        </div>
      )}

      {/* Floating AI Tutor Assistant */}
      <AiLessonAssistant lessonTitle={lesson.title} lessonContent={lesson.content} />
    </div>
  );
}
