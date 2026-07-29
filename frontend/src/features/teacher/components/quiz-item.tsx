'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { quizService } from '@/services/quiz.service';

export function QuizItem({
  quiz,
  questionFormFor,
  newQuestion,
  onShowQuestionForm,
  onAddQuestion,
  setNewQuestion,
  setQuestionFormFor,
}: {
  quiz: { id: string; title: string; passingScore: number; _count?: { questions: number } };
  questionFormFor: string | null;
  newQuestion: {
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
    options: string;
    correctAnswer: string;
    points: number;
    topic: string;
  };
  onShowQuestionForm: () => void;
  onAddQuestion: () => void;
  setNewQuestion: (v: typeof newQuestion) => void;
  setQuestionFormFor: (v: string | null) => void;
}) {
  const { data: quizDetail } = useQuery({
    queryKey: ['quiz', quiz.id],
    queryFn: () => quizService.getById(quiz.id, true),
  });

  const parsedOptions = newQuestion.options
    ? newQuestion.options.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-foreground">{quiz.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {quiz._count?.questions ?? 0} câu hỏi · Yêu cầu đạt {quiz.passingScore}%
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={onShowQuestionForm}>
          <Plus className="mr-1 h-3.5 w-3.5 text-primary" />
          Thêm câu hỏi
        </Button>
      </div>

      {questionFormFor === quiz.id && (
        <div className="mt-4 space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4 animate-in fade-in-50 duration-150">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Thêm câu hỏi mới</p>
          
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Loại câu hỏi</label>
              <select
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={newQuestion.type}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    type: e.target.value as typeof newQuestion.type,
                  })
                }
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều lựa chọn</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="ESSAY">Tự luận ngắn / dài</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Số điểm</label>
              <Input
                type="number"
                placeholder="10"
                value={newQuestion.points}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, points: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Nội dung câu hỏi</label>
            <textarea
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nhập nội dung câu hỏi..."
              rows={2}
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            />
          </div>

          {newQuestion.type !== 'ESSAY' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">Các lựa chọn đáp án</label>
                <Input
                  placeholder="Nhập các lựa chọn cách nhau bởi dấu phẩy (VD: Hà Nội, Đà Nẵng, HCM)"
                  value={newQuestion.options}
                  onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                />
                {parsedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground self-center mr-1">Lựa chọn đã nhận diện:</span>
                    {parsedOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`text-xs px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          newQuestion.correctAnswer === opt
                            ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500 font-bold'
                            : 'bg-card text-foreground border-border hover:bg-secondary'
                        }`}
                        onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                      >
                        {opt} {newQuestion.correctAnswer === opt && '✓ (Đúng)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Đáp án đúng chính xác</label>
                <Input
                  placeholder="Copy hoặc chọn chip ở trên làm đáp án đúng"
                  value={newQuestion.correctAnswer}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
                  }
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Chủ đề bài học (Tag)</label>
            <Input
              placeholder="VD: Data Structure, Syntax..."
              value={newQuestion.topic}
              onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onAddQuestion} disabled={!newQuestion.text}>
              Lưu câu hỏi
            </Button>
            <Button size="sm" variant="outline" onClick={() => setQuestionFormFor(null)}>
              Hủy
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2">
        {quizDetail?.questions?.map((q, idx) => (
          <div key={q.id} className="rounded-lg border border-border/60 bg-secondary/30 px-3.5 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                  {q.type}
                </Badge>
                <span className="text-xs font-semibold text-primary">{q.points} điểm</span>
              </div>
              {q.topic && (
                <Badge variant="primary" className="text-[10px]">
                  {q.topic}
                </Badge>
              )}
            </div>
            <p className="mt-1.5 font-medium text-foreground text-xs">
              <span className="font-bold text-muted-foreground">Q{idx + 1}:</span> {q.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
