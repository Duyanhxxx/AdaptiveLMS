import { Metadata } from 'next';
import { CreateQuizView } from '@/features/authoring/create-quiz-view';

export const metadata: Metadata = {
  title: 'Tạo Trắc Nghiệm | Adaptive LMS',
};

export default function CreateQuizPage({ params }: { params: { id: string } }) {
  return <CreateQuizView lessonId={params.id} />;
}
