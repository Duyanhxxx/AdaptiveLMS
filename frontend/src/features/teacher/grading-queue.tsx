'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { submissionsService } from '@/services/submissions.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';

export function GradingQueue() {
  const queryClient = useQueryClient();
  const [grading, setGrading] = useState<Record<string, { points: number; feedback: string }>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['pending-submissions'],
    queryFn: () => submissionsService.getAll({ status: 'SUBMITTED', limit: '20' }),
  });

  const gradeMutation = useMutation({
    mutationFn: submissionsService.gradeEssay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: submissionsService.suggestGrade,
    onSuccess: (suggestion, answerId) => {
      setGrading((prev) => ({
        ...prev,
        [answerId]: {
          points: suggestion.suggestedPoints,
          feedback: suggestion.feedback,
        },
      }));
    },
  });

  const pendingEssays =
    data?.data.flatMap((sub) =>
      sub.answers
        .filter((a) => a.question.type === 'ESSAY' && a.isCorrect === null)
        .map((a) => ({ submission: sub, answer: a })),
    ) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chấm bài tự luận"
        description="Chấm bài nhất quán theo rubric, phản hồi phù hợp từng nhóm học viên"
        icon={ClipboardCheck}
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : pendingEssays.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Không có bài tự luận nào cần chấm.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {pendingEssays.map(({ submission, answer }) => {
            const form = grading[answer.id] ?? { points: 0, feedback: '' };

            return (
              <GlassCard key={answer.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {submission.student.firstName} {submission.student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {submission.quiz.title} · {submission.quiz.lesson.title}
                    </p>
                  </div>
                  <Badge variant="warning">Chờ chấm</Badge>
                </div>

                <div className="rounded-xl bg-secondary/40 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Câu hỏi:</p>
                  <p className="mt-1">{answer.question.text}</p>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">Bài làm:</p>
                  <p className="mt-1 whitespace-pre-wrap">{answer.answerText}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Điểm (tối đa {answer.question.points})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={answer.question.points}
                      value={form.points}
                      onChange={(e) =>
                        setGrading((prev) => ({
                          ...prev,
                          [answer.id]: { ...form, points: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Phản hồi cho học viên</Label>
                    <textarea
                      className="min-h-24 w-full rounded-xl border border-input bg-card/80 px-3 py-2 text-sm"
                      value={form.feedback}
                      onChange={(e) =>
                        setGrading((prev) => ({
                          ...prev,
                          [answer.id]: { ...form, feedback: e.target.value },
                        }))
                      }
                      placeholder="Nhận xét cụ thể, khuyến khích tiến bộ..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => suggestMutation.mutate(answer.id)}
                    disabled={suggestMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4" />
                    Gợi ý AI (rubric)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      gradeMutation.mutate({
                        answerId: answer.id,
                        pointsEarned: form.points,
                        feedback: form.feedback,
                      })
                    }
                    disabled={gradeMutation.isPending}
                  >
                    Xác nhận chấm
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
