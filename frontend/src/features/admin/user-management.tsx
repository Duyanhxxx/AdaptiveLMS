'use client';

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
import type { Role } from '@/types';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['TEACHER', 'STUDENT']),
});

type FormData = z.infer<typeof schema>;

export function UserManagement() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'TEACHER' },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersService.list({ limit: '50', sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) =>
      usersService.createByAdmin({ ...payload, role: payload.role as Role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      reset({ role: 'TEACHER', email: '', password: '', firstName: '', lastName: '' });
    },
  });

  const onSubmit = async (values: FormData) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-xl font-semibold">Tạo tài khoản Teacher/Student</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin có thể tạo tài khoản cho giáo viên và học viên từ đây.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              {...register('role')}
            >
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          {createMutation.error && (
            <p className="md:col-span-2 text-sm text-destructive">
              Tạo tài khoản thất bại. Email có thể đã tồn tại.
            </p>
          )}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
            </Button>
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold">Danh sách tài khoản</h2>
        <p className="mt-1 text-sm text-muted-foreground">50 tài khoản mới nhất</p>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-4 text-sm text-destructive">Không tải được danh sách tài khoản.</p>
        ) : (
          <div className="mt-6 space-y-2">
            {data?.data.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {u.firstName} {u.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.role === 'ADMIN' ? 'warning' : u.role === 'TEACHER' ? 'default' : 'outline'}>
                  {u.role}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

