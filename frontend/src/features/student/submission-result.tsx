'use client';

import { useQuery } from '@tanstack/react-query';
import { Award, Clock } from 'lucide-react';
import { submissionsService } from '@/services/submissions.service';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';

export function SubmissionResult({ submissionId }: { submissionId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: () => submissionsService.getById(submissionId),
    refetchInterval: (query) =>
      query.state.data?.status === 'SUBMITTED' ? 5000 : false,
  });

  if (isLoading) return <Skeleton className="h-48 rounded-2xl" />;
  if (!data) return null;

  const pct = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
  const passed = pct >= data.quiz.passingScore;

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kết quả bài kiểm tra</h3>
          <p className="text-sm text-muted-foreground">{data.quiz.title}</p>
        </div>
        <Badge variant={passed ? 'success' : 'destructive'}>
          {pct}% {passed ? 'Đạt' : 'Chưa đạt'}
        </Badge>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-primary" />
          {data.score}/{data.maxScore} điểm
        </div>
        {data.status === 'SUBMITTED' && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Đang chờ chấm bài tự luận
          </div>
        )}
      </div>

      <div className="space-y-3">
        {data.answers.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-border/60 bg-secondary/20 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{a.question.text}</p>
              <span className="text-sm">
                {a.pointsEarned}/{a.question.points}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {a.answerText}
            </p>
            {a.feedback && (
              <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium text-primary">Phản hồi: </span>
                {a.feedback}
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
