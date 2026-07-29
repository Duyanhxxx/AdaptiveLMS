import { Metadata } from 'next';
import { CreateAssignmentView } from '@/features/authoring/create-assignment-view';

export const metadata: Metadata = {
  title: 'Tạo Bài Tập | Adaptive LMS',
};

export default function CreateAssignmentPage({ params }: { params: { id: string } }) {
  return <CreateAssignmentView lessonId={params.id} />;
}
