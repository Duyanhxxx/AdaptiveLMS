'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { Search, UserPlus, Trash2, Shield, UserCheck, UserX, Mail, Filter } from 'lucide-react';
import { toast } from 'sonner';
import type { Role, User } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Họ không được để trống'),
  lastName: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự trở lên'),
  role: z.enum(['TEACHER', 'STUDENT', 'ADMIN']),
});

type FormData = z.infer<typeof schema>;

export function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'TEACHER' },
  });

  // Query Users List
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => {
      const params: Record<string, string> = {
        limit: '100',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      return usersService.list(params);
    },
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: (payload: FormData) =>
      usersService.createByAdmin({ ...payload, role: payload.role as Role }),
    onSuccess: () => {
      toast.success('Đã tạo tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      reset({ role: 'TEACHER', email: '', password: '', firstName: '', lastName: '' });
      setShowCreateModal(false);
    },
    onError: () => {
      toast.error('Tạo tài khoản thất bại. Email có thể đã tồn tại.');
    },
  });

  // Toggle Active Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái tài khoản');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Không thể thay đổi trạng thái tài khoản');
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      toast.success('Đã xóa tài khoản thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Không thể xóa tài khoản này');
    },
  });

  const onSubmit = async (values: FormData) => {
    await createMutation.mutateAsync(values);
  };

  const usersList = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">Tất cả Vai trò</option>
              <option value="STUDENT">Sinh viên (Student)</option>
              <option value="TEACHER">Giảng viên (Teacher)</option>
              <option value="ADMIN">Quản trị viên (Admin)</option>
            </select>
          </div>
        </div>

        <Button onClick={() => setShowCreateModal(!showCreateModal)} className="w-full md:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          {showCreateModal ? 'Đóng Form' : 'Tạo tài khoản Mới'}
        </Button>
      </GlassCard>

      {/* Create Account Form */}
      {showCreateModal && (
        <GlassCard className="p-6 border-2 border-primary/30 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Tạo tài khoản Người dùng Mới
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Quản trị viên có thể cấp quyền và tạo tài khoản trực tiếp cho Sinh viên, Giảng viên hoặc Admin khác.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Họ & Tên đệm</Label>
              <Input id="firstName" placeholder="Ví dụ: Nguyễn Văn" {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Tên</Label>
              <Input id="lastName" placeholder="Ví dụ: An" {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <Input id="email" type="email" placeholder="an.nguyen@domain.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mật khẩu ban đầu</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="role">Phân quyền Vai trò (Role)</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register('role')}
              >
                <option value="TEACHER">Teacher (Giáo viên)</option>
                <option value="STUDENT">Student (Học viên)</option>
                <option value="ADMIN">Admin (Quản trị viên)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? 'Đang khởi tạo...' : 'Xác nhận Tạo tài khoản'}
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Users Table List */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Danh sách Người dùng Hệ thống</h3>
            <p className="text-xs text-muted-foreground">Tổng cộng {usersList.length} người dùng phù hợp bộ lọc</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-6">Không tải được danh sách tài khoản.</p>
        ) : usersList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Không tìm thấy tài khoản nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-secondary/30">
                <tr>
                  <th className="p-3">Họ & Tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Vai trò (Role)</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {u.email}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          u.role === 'ADMIN'
                            ? 'warning'
                            : u.role === 'TEACHER'
                            ? 'default'
                            : 'outline'
                        }
                        className="font-bold text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {u.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={u.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        onClick={() =>
                          toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })
                        }
                      >
                        {u.isActive ? (
                          <UserX className="h-4 w-4 text-rose-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-emerald-500" />
                        )}
                      </Button>

                      {u.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Xóa tài khoản"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${u.email}?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
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
