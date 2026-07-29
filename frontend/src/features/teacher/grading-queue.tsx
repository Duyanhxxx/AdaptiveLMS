'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Sparkles, CheckCircle, User, BookOpen } from 'lucide-react';
import { submissionsService } from '@/services/submissions.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

export function GradingQueue() {
  const queryClient = useQueryClient();
  const [grading, setGrading] = useState<Record<string, { points: number; feedback: string }>>({});
  const [tab, setTab] = useState<'PENDING' | 'GRADED'>('PENDING');
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-submissions', tab],
    queryFn: () => submissionsService.getAll({ status: tab === 'PENDING' ? 'SUBMITTED' : 'GRADED', limit: '50' }),
  });

  const gradeMutation = useMutation({
    mutationFn: submissionsService.gradeEssay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-submissions'] });
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

  const displayedEssays =
    data?.data.flatMap((sub) =>
      sub.answers
        .filter(
          (a) =>
            a.question.type === 'ESSAY' &&
            (tab === 'PENDING' ? a.isCorrect === null : a.isCorrect !== null),
        )
        .map((a) => ({ submission: sub, answer: a })),
    ) ?? [];

  // Default select first item if none selected
  const activeItem = displayedEssays.find((item) => item.answer.id === selectedAnswerId) ?? displayedEssays[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chấm bài tự luận"
        description="Chấm bài nhất quán theo Rubric, hỗ trợ gợi ý điểm số & nhận xét thông minh từ AI"
        icon={ClipboardCheck}
      />

      <div className="flex items-center gap-3">
        <Button
          variant={tab === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('PENDING');
            setSelectedAnswerId(null);
          }}
        >
          Chờ chấm ({tab === 'PENDING' ? displayedEssays.length : '...'})
        </Button>
        <Button
          variant={tab === 'GRADED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setTab('GRADED');
            setSelectedAnswerId(null);
          }}
        >
          Đã chấm ({tab === 'GRADED' ? displayedEssays.length : '...'})
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] w-full rounded-xl" />
      ) : displayedEssays.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground/60" />
          <p className="text-muted-foreground font-medium">
            {tab === 'PENDING'
              ? 'Hiện tại không có bài tự luận nào cần chấm.'
              : 'Chưa có bài tự luận nào đã chấm.'}
          </p>
        </GlassCard>
      ) : (
        /* Split View Layout */
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Essay List */}
          <div className="md:col-span-5 space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {displayedEssays.map(({ submission, answer }) => {
              const isSelected = activeItem?.answer.id === answer.id;
              return (
                <div
                  key={answer.id}
                  className={cn(
                    'group p-4 rounded-xl border transition-all cursor-pointer bg-card',
                    isSelected
                      ? 'border-primary ring-1 ring-primary/20 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-secondary/30',
                  )}
                  onClick={() => setSelectedAnswerId(answer.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {submission.student.firstName[0]}
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        {submission.student.firstName} {submission.student.lastName}
                      </p>
                    </div>
                    <Badge variant={tab === 'PENDING' ? 'warning' : 'success'}>
                      {tab === 'PENDING' ? 'Chờ chấm' : 'Đã chấm'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs font-medium text-muted-foreground truncate">
                    <BookOpen className="inline mr-1 h-3 w-3" />
                    {submission.quiz.title}
                  </p>
                  <p className="mt-1 text-xs text-foreground/80 line-clamp-2 italic">
                    "{answer.answerText}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detail View & AI Grading Form */}
          {activeItem && (
            <div className="md:col-span-7">
              {(() => {
                const { submission, answer } = activeItem;
                const form = grading[answer.id] ?? {
                  points: answer.pointsEarned ?? 0,
                  feedback: answer.feedback ?? '',
                };
                const maxPoints = answer.question.points;

                return (
                  <GlassCard className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <h4 className="font-bold text-base text-foreground">
                            {submission.student.firstName} {submission.student.lastName}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {submission.quiz.title} · {submission.quiz.lesson.title}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => suggestMutation.mutate(answer.id)}
                        disabled={suggestMutation.isPending}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        {suggestMutation.isPending ? 'AI đang phân tích...' : 'Gợi ý AI (Rubric)'}
                      </Button>
                    </div>

                    {/* Question & Student Answer */}
                    <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Câu hỏi tự luận:
                        </span>
                        <p className="mt-1 text-sm font-semibold text-foreground">{answer.question.text}</p>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Bài làm của học viên:
                        </span>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-card p-3 rounded-md border border-border/60">
                          {answer.answerText}
                        </p>
                      </div>
                    </div>

                    {/* Quick Score Percentage Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Thao tác chấm điểm nhanh (Tối đa {maxPoints} điểm):
                        </Label>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                          const val = Math.round(maxPoints * pct * 10) / 10;
                          return (
                            <button
                              key={pct}
                              type="button"
                              className={cn(
                                'py-1.5 px-2 text-xs font-semibold rounded-md border transition-all cursor-pointer',
                                form.points === val
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-card hover:bg-secondary text-foreground',
                              )}
                              onClick={() =>
                                setGrading((prev) => ({
                                  ...prev,
                                  [answer.id]: { ...form, points: val },
                                }))
                              }
                            >
                              {pct * 100}% ({val} đ)
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Points Input & Feedback Textarea */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5 md:col-span-1">
                        <Label htmlFor="points" className="text-xs font-semibold">
                          Số điểm chính xác
                        </Label>
                        <Input
                          id="points"
                          type="number"
                          min={0}
                          max={maxPoints}
                          step={0.5}
                          value={form.points}
                          onChange={(e) =>
                            setGrading((prev) => ({
                              ...prev,
                              [answer.id]: { ...form, points: Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="feedback" className="text-xs font-semibold">
                          Nhận xét & Phản hồi
                        </Label>
                        <Input
                          id="feedback"
                          value={form.feedback}
                          onChange={(e) =>
                            setGrading((prev) => ({
                              ...prev,
                              [answer.id]: { ...form, feedback: e.target.value },
                            }))
                          }
                          placeholder="Nhập nhận xét động viên học viên..."
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full font-bold"
                      disabled={gradeMutation.isPending}
                      onClick={() =>
                        gradeMutation.mutate({
                          answerId: answer.id,
                          pointsEarned: form.points,
                          feedback: form.feedback,
                        })
                      }
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      {gradeMutation.isPending
                        ? 'Đang lưu kết quả...'
                        : tab === 'PENDING'
                          ? 'Xác nhận chấm điểm'
                          : 'Cập nhật điểm số'}
                    </Button>
                  </GlassCard>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
