'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, Award, HelpCircle } from 'lucide-react';
import { quizService } from '@/services/quiz.service';
import { submissionsService } from '@/services/submissions.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';
import { SubmissionResult } from './submission-result';
import { cn } from '@/lib/utils';

interface QuizTakerProps {
  quizId: string;
  onSubmitted?: (submissionId: string) => void;
}

export function QuizTaker({ quizId, onSubmitted }: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [startedAt] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz-take', quizId],
    queryFn: () => quizService.getById(quizId, false),
  });

  const startMutation = useMutation({
    mutationFn: () => submissionsService.create(quizId),
    onSuccess: (sub) => {
      setSubmissionId(sub.id);
      if (sub.status !== 'DRAFT') {
        setSubmitted(true);
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submissionsService.submit(submissionId!, {
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
        timeSpent: Math.floor((Date.now() - startedAt) / 1000),
      }),
    onSuccess: (sub) => {
      setSubmitted(true);
      onSubmitted?.(sub.id);
    },
  });

  useEffect(() => {
    if (quiz && !submissionId && !startMutation.isPending && !startMutation.isSuccess) {
      startMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, submissionId]);

  if (isLoading || !quiz) {
    return (
      <GlassCard className="p-8 text-center">
        <Clock className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Đang chuẩn bị đề thi...</p>
      </GlassCard>
    );
  }

  if (submitted && submissionId) {
    return <SubmissionResult submissionId={submissionId} />;
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const totalCount = quiz.questions?.length ?? 0;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  return (
    <GlassCard className="space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight">{quiz.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Yêu cầu điểm đạt: <span className="font-semibold text-primary">{quiz.passingScore}%</span>
            {quiz.timeLimit ? ` · Thời gian: ${quiz.timeLimit} phút` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary">
            <HelpCircle className="mr-1 h-3.5 w-3.5" />
            Đã làm: {answeredCount}/{totalCount} câu
          </Badge>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {quiz.questions?.map((q, i) => {
          const isAnswered = !!answers[q.id]?.trim();
          return (
            <div
              key={q.id}
              className={cn(
                'space-y-3 rounded-xl border p-5 transition-all duration-150 bg-card',
                isAnswered ? 'border-primary/40 shadow-sm' : 'border-border',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-foreground">
                  <span className="text-primary font-bold mr-1.5">Câu {i + 1}.</span> {q.text}
                </p>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  <Award className="mr-1 h-3 w-3 text-amber-500" /> {q.points} điểm
                </Badge>
              </div>

              {q.type === 'ESSAY' ? (
                <textarea
                  className="min-h-32 w-full rounded-lg border border-border bg-secondary/30 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  value={answers[q.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Nhập câu trả lời tự luận chi tiết của bạn tại đây..."
                />
              ) : q.type === 'TRUE_FALSE' ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {['True', 'False'].map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cn(
                          'flex items-center justify-center rounded-lg border py-3 px-4 text-sm font-semibold transition-all cursor-pointer select-none',
                          selected
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-secondary/20 hover:bg-secondary text-foreground',
                        )}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      >
                        {opt === 'True' ? 'Đúng (True)' : 'Sai (False)'}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {(q.options as string[] | undefined)?.map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg border py-3 px-4 text-left text-sm font-medium transition-all cursor-pointer select-none',
                          selected
                            ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm'
                            : 'border-border bg-secondary/20 hover:bg-secondary/60 text-foreground',
                        )}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      >
                        <span>{opt}</span>
                        <div
                          className={cn(
                            'h-4 w-4 rounded-full border flex items-center justify-center transition-all',
                            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
                          )}
                        >
                          {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Submit Action */}
      <div className="pt-2">
        <Button
          size="lg"
          className="w-full font-bold shadow-md"
          disabled={!allAnswered || submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {submitMutation.isPending ? 'Đang chấm bài...' : 'Hoàn thành & Nộp bài'}
        </Button>
        {!allAnswered && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Vui lòng hoàn thành tất cả các câu hỏi ({answeredCount}/{totalCount}) trước khi nộp bài.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
