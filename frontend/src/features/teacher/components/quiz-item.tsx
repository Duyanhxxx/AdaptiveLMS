'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{quiz.title}</p>
          <p className="text-xs text-muted-foreground">
            {quiz._count?.questions ?? 0} câu · Đạt {quiz.passingScore}%
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onShowQuestionForm}>
          <Plus className="h-3 w-3" />
          Câu hỏi
        </Button>
      </div>

      {questionFormFor === quiz.id && (
        <div className="mt-3 space-y-2 rounded-lg border border-border/40 bg-card/50 p-3">
          <select
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
            value={newQuestion.type}
            onChange={(e) =>
              setNewQuestion({
                ...newQuestion,
                type: e.target.value as typeof newQuestion.type,
              })
            }
          >
            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
            <option value="TRUE_FALSE">Đúng/Sai</option>
            <option value="ESSAY">Tự luận</option>
          </select>
          <textarea
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
            placeholder="Nội dung câu hỏi"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          />
          {newQuestion.type !== 'ESSAY' && (
            <>
              <div className="space-y-1">
                <Input
                  placeholder="Các lựa chọn (VD: A, B, C, D)"
                  value={newQuestion.options}
                  onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground px-1">
                  Nhập các đáp án cách nhau bằng dấu phẩy (VD: Hà Nội, Hồ Chí Minh, Đà Nẵng)
                </p>
              </div>
              <div className="space-y-1">
                <Input
                  placeholder="Đáp án đúng (phải khớp chính xác với 1 lựa chọn ở trên)"
                  value={newQuestion.correctAnswer}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
                  }
                />
                <p className="text-[10px] text-muted-foreground px-1">
                  Copy y hệt một trong các lựa chọn trên để máy tự chấm điểm (VD: Hà Nội)
                </p>
              </div>
            </>
          )}
          <Input
            type="number"
            placeholder="Điểm"
            value={newQuestion.points}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, points: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Chủ đề"
            value={newQuestion.topic}
            onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onAddQuestion} disabled={!newQuestion.text}>
              Thêm
            </Button>
            <Button size="sm" variant="outline" onClick={() => setQuestionFormFor(null)}>
              Hủy
            </Button>
          </div>
        </div>
      )}

      {quizDetail?.questions?.map((q) => (
        <div key={q.id} className="mt-2 rounded-lg bg-card/60 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {q.type}
            </Badge>
            <span className="text-xs text-muted-foreground">{q.points} điểm</span>
          </div>
          <p className="mt-1">{q.text}</p>
        </div>
      ))}
    </div>
  );
}
