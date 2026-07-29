import { Metadata } from 'next';
import { StudentDetailView } from '@/features/students/student-detail-view';

export const metadata: Metadata = {
  title: 'Chi tiết Học viên | Adaptive LMS',
};

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return <StudentDetailView studentId={params.id} />;
}
