'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock } from 'lucide-react';
import { quizService } from '@/services/quiz.service';
import { submissionsService } from '@/services/submissions.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';
import { SubmissionResult } from './submission-result';

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
    onSuccess: (sub) => setSubmissionId(sub.id),
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
    return <p className="text-sm text-muted-foreground">Đang tải quiz...</p>;
  }

  if (submitted && submissionId) {
    return <SubmissionResult submissionId={submissionId} />;
  }

  const allAnswered = quiz.questions?.every((q) => answers[q.id]?.trim());

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{quiz.title}</h3>
          <p className="text-sm text-muted-foreground">
            Điểm đạt: {quiz.passingScore}%
            {quiz.timeLimit ? ` · ${quiz.timeLimit} phút` : ''}
          </p>
        </div>
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {quiz.questions?.length ?? 0} câu
        </Badge>
      </div>

      <div className="space-y-6">
        {quiz.questions?.map((q, i) => (
          <div key={q.id} className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4">
            <p className="font-medium">
              {i + 1}. {q.text}
              <span className="ml-2 text-xs text-muted-foreground">({q.points} điểm)</span>
            </p>

            {q.type === 'ESSAY' ? (
              <textarea
                className="min-h-32 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Viết câu trả lời của bạn..."
              />
            ) : q.type === 'TRUE_FALSE' ? (
              <div className="flex gap-3">
                {['True', 'False'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(q.options as string[] | undefined)?.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        disabled={!allAnswered || submitMutation.isPending}
        onClick={() => submitMutation.mutate()}
      >
        <CheckCircle className="h-4 w-4" />
        {submitMutation.isPending ? 'Đang nộp...' : 'Nộp bài'}
      </Button>
    </GlassCard>
  );
}
