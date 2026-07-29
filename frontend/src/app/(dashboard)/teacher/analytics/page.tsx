import { Metadata } from 'next';
import { TeacherAnalyticsView } from '@/features/analytics/teacher-analytics-view';

export const metadata: Metadata = {
  title: 'Phân tích Lớp học | Adaptive LMS',
};

export default function TeacherAnalyticsPage() {
  return <TeacherAnalyticsView />;
}
