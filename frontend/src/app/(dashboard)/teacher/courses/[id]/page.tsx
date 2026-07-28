'use client';

import { use } from 'react';
import { CourseEditor } from '@/features/teacher/course-editor';

export default function TeacherCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CourseEditor courseId={id} />;
}
