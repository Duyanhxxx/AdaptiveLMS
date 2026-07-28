'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/layout/glass-card';
import { lessonsService } from '@/services/lessons.service';
import { QuizItem } from './quiz-item';

export function LessonItem({
  lesson,
  index,
  total,
  editing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onMoveUp,
  onMoveDown,
  quizFormFor,
  questionFormFor,
  newQuiz,
  newQuestion,
  onDelete,
  onShowQuizForm,
  onCreateQuiz,
  onShowQuestionForm,
  onAddQuestion,
  setNewQuiz,
  setNewQuestion,
  setQuizFormFor,
  setQuestionFormFor,
}: {
  lesson: { id: string; title: string; duration: number; isPublished: boolean; content?: string; topics?: string[] };
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: { title: string; content: string; duration: number; topics: string[] }) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  quizFormFor: string | null;
  questionFormFor: string | null;
  newQuiz: { title: string; passingScore: number };
  newQuestion: {
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
    options: string;
    correctAnswer: string;
    points: number;
    topic: string;
  };
  onDelete: () => void;
  onShowQuizForm: () => void;
  onCreateQuiz: () => void;
  onShowQuestionForm: (quizId: string) => void;
  onAddQuestion: () => void;
  setNewQuiz: (v: { title: string; passingScore: number }) => void;
  setNewQuestion: (v: typeof newQuestion) => void;
  setQuizFormFor: (v: string | null) => void;
  setQuestionFormFor: (v: string | null) => void;
}) {
  const { data: lessonDetail } = useQuery({
    queryKey: ['lesson-detail', lesson.id],
    queryFn: () => lessonsService.getById(lesson.id),
  });

  const [editForm, setEditForm] = useState({
    title: lesson.title,
    content: '',
    duration: lesson.duration,
    topics: '',
  });

  const startEdit = () => {
    setEditForm({
      title: lessonDetail?.title ?? lesson.title,
      content: lessonDetail?.content ?? '',
      duration: lessonDetail?.duration ?? lesson.duration,
      topics: (lessonDetail?.topics ?? []).join(', '),
    });
    onEdit();
  };

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} disabled={index === 0}>
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} disabled={index >= total - 1}>
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <h3 className="font-semibold">{lesson.title}</h3>
            <p className="text-xs text-muted-foreground">#{index + 1} · {lesson.duration} phút</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={startEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-secondary/30 p-4">
          <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Tiêu đề" />
          <textarea
            className="min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            placeholder="Nội dung"
          />
          <Input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })} />
          <Input value={editForm.topics} onChange={(e) => setEditForm({ ...editForm, topics: e.target.value })} placeholder="Chủ đề" />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSaveEdit({
              title: editForm.title,
              content: editForm.content,
              duration: editForm.duration,
              topics: editForm.topics.split(',').map((t) => t.trim()).filter(Boolean),
            })}>
              Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>Hủy</Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Quiz</p>
          <Button variant="outline" size="sm" onClick={onShowQuizForm}>
            <Plus className="h-3 w-3" />
            Thêm quiz
          </Button>
        </div>

        {quizFormFor === lesson.id && (
          <div className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-3">
            <Input
              placeholder="Tên quiz"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Điểm đạt (%)"
              value={newQuiz.passingScore}
              onChange={(e) =>
                setNewQuiz({ ...newQuiz, passingScore: Number(e.target.value) })
              }
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onCreateQuiz} disabled={!newQuiz.title}>
                Tạo quiz
              </Button>
              <Button size="sm" variant="outline" onClick={() => setQuizFormFor(null)}>
                Hủy
              </Button>
            </div>
          </div>
        )}

        {lessonDetail?.quizzes?.map((quiz) => (
          <QuizItem
            key={quiz.id}
            quiz={quiz}
            questionFormFor={questionFormFor}
            newQuestion={newQuestion}
            onShowQuestionForm={() => onShowQuestionForm(quiz.id)}
            onAddQuestion={onAddQuestion}
            setNewQuestion={setNewQuestion}
            setQuestionFormFor={setQuestionFormFor}
          />
        ))}
      </div>
    </GlassCard>
  );
}
