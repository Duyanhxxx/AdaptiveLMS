'use client';
import { LessonItem } from './components/lesson-item';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { useCourseEditor } from '@/hooks/use-course-editor';

export function CourseEditor({ courseId }: { courseId: string }) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'settings'>('lessons');
  const editor = useCourseEditor(courseId);

  if (editor.isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!editor.course) return <p className="text-destructive">Không tìm thấy khóa học</p>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/teacher/courses">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex gap-2">
              <Badge variant={editor.course.isPublished ? 'success' : 'outline'}>
                {editor.course.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline">{editor.course.difficulty}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{editor.course.title}</h1>
            <p className="mt-1 text-muted-foreground">{editor.course.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              editor.updateCourse.mutate({ isPublished: !editor.course?.isPublished })
            }
          >
            {editor.course.isPublished ? 'Ẩn khóa học' : 'Xuất bản'}
          </Button>
        </div>
      </GlassCard>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'lessons' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen className="h-4 w-4" />
          Bài học & Quiz
        </Button>
      </div>

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Danh sách bài học</h2>
            <Button size="sm" onClick={() => editor.setLessonForm(!editor.lessonForm)}>
              <Plus className="h-4 w-4" />
              Thêm bài học
            </Button>
          </div>

          {editor.lessonForm && (
            <GlassCard className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Tiêu đề bài học</Label>
                  <Input
                    value={editor.newLesson.title}
                    onChange={(e) => editor.setNewLesson({ ...editor.newLesson, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nội dung</Label>
                  <textarea
                    className="min-h-32 w-full rounded-xl border border-input bg-card/80 px-3 py-2 text-sm"
                    value={editor.newLesson.content}
                    onChange={(e) => editor.setNewLesson({ ...editor.newLesson, content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thời lượng (phút)</Label>
                  <Input
                    type="number"
                    value={editor.newLesson.duration}
                    onChange={(e) =>
                      editor.setNewLesson({ ...editor.newLesson, duration: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chủ đề (cách nhau bởi dấu phẩy)</Label>
                  <Input
                    value={editor.newLesson.topics}
                    onChange={(e) => editor.setNewLesson({ ...editor.newLesson, topics: e.target.value })}
                    placeholder="JavaScript, ES6"
                  />
                </div>
              </div>
              <Button
                onClick={() => editor.createLesson.mutate()}
                disabled={!editor.newLesson.title || !editor.newLesson.content || editor.createLesson.isPending}
              >
                {editor.createLesson.isPending ? 'Đang tạo...' : 'Tạo bài học'}
              </Button>
            </GlassCard>
          )}

          {editor.lessons?.data.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={index}
              total={editor.lessons.data.length}
              editing={editor.editingLessonId === lesson.id}
              onEdit={() => editor.setEditingLessonId(lesson.id)}
              onCancelEdit={() => editor.setEditingLessonId(null)}
              onSaveEdit={(data) => {
                editor.updateLesson.mutate(
                  { id: lesson.id, data },
                  { onSuccess: () => editor.setEditingLessonId(null) },
                );
              }}
              onMoveUp={() => {
                if (index === 0) return;
                const ids = [...editor.lessons.data.map((l) => l.id)];
                [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                editor.reorderLessons.mutate(ids);
              }}
              onMoveDown={() => {
                if (index >= editor.lessons.data.length - 1) return;
                const ids = [...editor.lessons.data.map((l) => l.id)];
                [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
                editor.reorderLessons.mutate(ids);
              }}
              quizFormFor={editor.quizFormFor}
              questionFormFor={editor.questionFormFor}
              newQuiz={editor.newQuiz}
              newQuestion={editor.newQuestion}
              onDelete={() => {
                if (confirm('Xóa bài học?')) editor.deleteLesson.mutate(lesson.id);
              }}
              onShowQuizForm={() => editor.setQuizFormFor(lesson.id)}
              onCreateQuiz={() => editor.createQuiz.mutate(lesson.id)}
              onShowQuestionForm={(quizId) => editor.setQuestionFormFor(quizId)}
              onAddQuestion={() => editor.questionFormFor && editor.addQuestion.mutate(editor.questionFormFor)}
              setNewQuiz={editor.setNewQuiz}
              setNewQuestion={editor.setNewQuestion}
              setQuizFormFor={editor.setQuizFormFor}
              setQuestionFormFor={editor.setQuestionFormFor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
