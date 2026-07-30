'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { AdminCourseManagement } from '@/features/admin/course-management';

export default function AdminCoursesPage() {
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
        title="Quản lý Khóa học Hệ thống"
        description="Admin tạo, duyệt xuất bản và quản lý toàn bộ khóa học nền tảng"
        icon={BookOpen}
      />
      <AdminCourseManagement />
    </div>
  );
}
