'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { coursesService } from '@/services/courses.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  isPublished: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function TeacherCourses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-courses', user?.id],
    queryFn: () =>
      coursesService.getAll({
        teacherId: user!.id,
        limit: '50',
      }),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'BEGINNER', isPublished: false },
  });

  const createMutation = useMutation({
    mutationFn: coursesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-courses'] });
      reset();
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursesService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teacher-courses'] }),
  });

  const onSubmit = (values: FormData) => createMutation.mutate(values);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quản lý khóa học"
        description="Tạo, chỉnh sửa và xuất bản khóa học của bạn"
        icon={BookOpen}
        action={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Tạo khóa học
          </Button>
        }
      />

      {showForm && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Khóa học mới</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Tiêu đề</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Mô tả</Label>
              <textarea
                className="flex min-h-24 w-full rounded-xl border border-input bg-card/80 px-3 py-2 text-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Độ khó</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm"
                {...register('difficulty')}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isPublished" {...register('isPublished')} />
              <Label htmlFor="isPublished">Xuất bản ngay</Label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo khóa học'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Hủy
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <GlassCard className="p-12 text-center">
          <p className="text-muted-foreground">Chưa có khóa học nào. Tạo khóa học đầu tiên!</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.data.map((course) => (
            <GlassCard key={course.id} hover className="flex flex-col justify-between">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant={course.isPublished ? 'success' : 'outline'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant="outline">{course.difficulty}</Badge>
                </div>
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {course._count?.lessons ?? 0} bài học
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teacher/courses/${course.id}`}>
                    <Pencil className="h-3 w-3" />
                    Chỉnh sửa
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('Xóa khóa học này?')) deleteMutation.mutate(course.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
