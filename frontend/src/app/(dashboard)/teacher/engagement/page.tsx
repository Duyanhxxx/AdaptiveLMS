import { Metadata } from 'next';
import { TeacherEngagementView } from '@/features/engagement/teacher-engagement-view';

export const metadata: Metadata = {
  title: 'Tương tác & Lịch học | Adaptive LMS',
};

export default function TeacherEngagementPage() {
  return <TeacherEngagementView />;
}
