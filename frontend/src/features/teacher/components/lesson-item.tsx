'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Video } from 'lucide-react';
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
  lesson: { id: string; title: string; duration: number; isPublished: boolean; content?: string; topics?: string[]; videoUrl?: string | null };
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: { title: string; content: string; duration: number; topics: string[]; videoUrl?: string }) => void;
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
    videoUrl: '',
  });

  const startEdit = () => {
    setEditForm({
      title: lessonDetail?.title ?? lesson.title,
      content: lessonDetail?.content ?? '',
      duration: lessonDetail?.duration ?? lesson.duration,
      topics: (lessonDetail?.topics ?? []).join(', '),
      videoUrl: lessonDetail?.videoUrl ?? '',
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
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{lesson.title}</h3>
              {lessonDetail?.videoUrl && (
                <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 font-semibold px-2 py-0.5 rounded border border-red-500/20">
                  <Video className="h-3 w-3" /> YouTube Video
                </span>
              )}
            </div>
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
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Tiêu đề bài học</label>
            <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="VD: Khái niệm React Components" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Link Video YouTube (Tùy chọn)</label>
            <Input
              value={editForm.videoUrl}
              onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
              placeholder="VD: https://www.youtube.com/watch?v=dQw4w9WgXcQ hoặc https://youtu.be/..."
            />
            <p className="text-[10px] text-muted-foreground mt-1">Dán link YouTube vào đây để tự động chèn trình phát Video vào bài học cho học viên.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Nội dung bài học (Văn bản / Markdown)</label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              placeholder="Nội dung bài học..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Thời lượng (Phút)</label>
              <Input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Chủ đề (Cách nhau bởi dấu phẩy)</label>
              <Input value={editForm.topics} onChange={(e) => setEditForm({ ...editForm, topics: e.target.value })} placeholder="VD: React, Frontend" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onSaveEdit({
              title: editForm.title,
              content: editForm.content,
              duration: editForm.duration,
              topics: editForm.topics.split(',').map((t) => t.trim()).filter(Boolean),
              videoUrl: editForm.videoUrl,
            })}>
              Lưu bài học
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
            <div>
              <Input
                type="number"
                placeholder="Điểm đạt (VD: 60)"
                value={newQuiz.passingScore}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, passingScore: Number(e.target.value) })
                }
              />
              <p className="text-[10px] text-muted-foreground px-1 mt-1">
                Phần trăm điểm tối thiểu để qua bài (VD: Nhập 60 tức là cần đúng 60% tổng điểm)
              </p>
            </div>
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
