'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { UserManagement } from '@/features/admin/user-management';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace(
        user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard',
      );
    }
  }, [isLoading, user, router]);

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quản lý tài khoản"
        description="Admin tạo và quản lý tài khoản teacher/student"
        icon={Users}
      />
      <UserManagement />
    </div>
  );
}
