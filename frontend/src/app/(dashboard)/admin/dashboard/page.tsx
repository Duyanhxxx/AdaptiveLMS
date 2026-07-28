'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboardView } from '@/features/dashboard/admin-dashboard';

export default function AdminDashboardPage() {
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

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!user || user.role !== 'ADMIN') return null;

  return <AdminDashboardView />;
}

