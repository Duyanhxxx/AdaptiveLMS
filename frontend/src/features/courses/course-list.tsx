'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { coursesService } from '@/services/courses.service';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Course } from '@/types';

const difficultyColors: Record<string, string> = {
  BEGINNER: 'from-emerald-500 to-teal-500',
  INTERMEDIATE: 'from-amber-500 to-orange-500',
  ADVANCED: 'from-rose-500 to-pink-500',
  EXPERT: 'from-violet-500 to-purple-600',
};

function CourseCard({ course }: { course: Course }) {
  const gradient = difficultyColors[course.difficulty] ?? 'from-indigo-500 to-violet-500';

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group glass-card card-hover block overflow-hidden rounded-2xl p-0"
    >
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline">{course.difficulty}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            {course._count?.lessons ?? 0} lessons
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
        {course.teacher && (
          <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
              {course.teacher.firstName[0]}
              {course.teacher.lastName[0]}
            </div>
            <p className="text-xs text-muted-foreground">
              {course.teacher.firstName} {course.teacher.lastName}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function CourseList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesService.getAll({ limit: '20' }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-destructive">Failed to load courses.</p>;
  }

  if (data.data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-16 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {data.data.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
