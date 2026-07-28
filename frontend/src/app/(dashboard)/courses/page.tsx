import { CourseList } from '@/features/courses/course-list';
import { PageHeader } from '@/components/layout/page-header';
import { BookOpen } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Courses"
        description="Browse available learning paths"
        icon={BookOpen}
      />
      <CourseList />
    </div>
  );
}
