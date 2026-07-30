'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/services/courses.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { Search, Plus, Trash2, BookOpen, Eye, EyeOff, Edit3, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { Course } from '@/types';

export function AdminCourseManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for Create Course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  // Query Courses List (Admin can see published & draft courses)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () =>
      coursesService.getAll({
        limit: '100',
        search: search || undefined,
      }),
  });

  // Create Course Mutation
  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }) =>
      coursesService.create(payload),
    onSuccess: () => {
      toast.success('Đã tạo khóa học mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Không thể tạo khóa học. Vui lòng kiểm tra lại thông tin.');
    },
  });

  // Toggle Publish Status Mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      coursesService.update(id, { isPublished }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái xuất bản khóa học');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: () => {
      toast.error('Không thể thay đổi trạng thái xuất bản');
    },
  });

  // Delete Course Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesService.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa khóa học thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: () => {
      toast.error('Không thể xóa khóa học này');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error('Vui lòng điền đầy đủ Tên và Mô tả khóa học');
      return;
    }
    createMutation.mutate({ title, description, difficulty });
  };

  const coursesList = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên hoặc mô tả khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setShowCreateModal(!showCreateModal)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {showCreateModal ? 'Đóng Form' : 'Tạo Khóa học Mới'}
        </Button>
      </GlassCard>

      {/* Create Course Form Modal */}
      {showCreateModal && (
        <GlassCard className="p-6 border-2 border-primary/30 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Khởi tạo Khóa học Mới (Admin Level)
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Quản trị viên có thể tự khởi tạo khóa học và chỉ định nội dung bài học sau.
          </p>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Tên Khóa học</Label>
              <Input
                id="title"
                placeholder="Ví dụ: Lập trình Python Nâng cao & AI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Mô tả Khóa học</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Nhập nội dung mô tả chi tiết khóa học..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Cấp độ Khóa học</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="BEGINNER">BEGINNER (Cơ bản)</option>
                <option value="INTERMEDIATE">INTERMEDIATE (Trung cấp)</option>
                <option value="ADVANCED">ADVANCED (Nâng cao)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Xác nhận Tạo Khóa học'}
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Courses List Table */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Danh sách Khóa học Nền tảng</h3>
            <p className="text-xs text-muted-foreground">Tổng cộng {coursesList.length} khóa học</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-6">Không tải được danh sách khóa học.</p>
        ) : coursesList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có khóa học nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-secondary/30">
                <tr>
                  <th className="p-3">Khóa học</th>
                  <th className="p-3">Giảng viên</th>
                  <th className="p-3">Cấp độ</th>
                  <th className="p-3">Học viên</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coursesList.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground max-w-xs truncate">
                      <p className="truncate font-bold">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.description}</p>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'Hệ thống Admin'}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {c.difficulty}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs font-semibold text-indigo-600">
                      {c._count?.enrollments ?? 0} HV
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          c.isPublished
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}
                      >
                        {c.isPublished ? 'Đã Xuất bản' : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={c.isPublished ? 'Hủy xuất bản' : 'Xuất bản khóa học'}
                        onClick={() =>
                          togglePublishMutation.mutate({ id: c.id, isPublished: !c.isPublished })
                        }
                      >
                        {c.isPublished ? (
                          <EyeOff className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        title="Xóa khóa học"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa khóa học "${c.title}"?`)) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
