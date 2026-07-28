import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { quizService } from '@/services/quiz.service';
import { useState } from 'react';

export function useCourseEditor(courseId: string) {
  const queryClient = useQueryClient();

  const [lessonForm, setLessonForm] = useState(false);
  const [quizFormFor, setQuizFormFor] = useState<string | null>(null);
  const [questionFormFor, setQuestionFormFor] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    duration: 30,
    topics: '',
  });

  const [newQuiz, setNewQuiz] = useState({ title: '', passingScore: 60 });
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
    options: string;
    correctAnswer: string;
    points: number;
    topic: string;
  }>({
    text: '',
    type: 'MULTIPLE_CHOICE',
    options: 'A,B,C,D',
    correctAnswer: 'A',
    points: 1,
    topic: '',
  });

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getById(courseId),
  });

  const { data: lessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonsService.getAll({ courseId, limit: '50' }),
  });

  const updateCourse = useMutation({
    mutationFn: (data: { isPublished?: boolean; title?: string; description?: string }) =>
      coursesService.update(courseId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
  });

  const createLesson = useMutation({
    mutationFn: () =>
      lessonsService.create({
        courseId,
        title: newLesson.title,
        content: newLesson.content,
        duration: newLesson.duration,
        topics: newLesson.topics.split(',').map((t) => t.trim()).filter(Boolean),
        order: lessons?.data.length ?? 0,
        isPublished: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      setLessonForm(false);
      setNewLesson({ title: '', content: '', duration: 30, topics: '' });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: lessonsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });

  const updateLesson = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof lessonsService.update>[1] }) =>
      lessonsService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });

  const reorderLessons = useMutation({
    mutationFn: (lessonIds: string[]) => lessonsService.reorder(courseId, lessonIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });

  const createQuiz = useMutation({
    mutationFn: (lessonId: string) =>
      quizService.create({ lessonId, title: newQuiz.title, passingScore: newQuiz.passingScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
      setQuizFormFor(null);
      setNewQuiz({ title: '', passingScore: 60 });
    },
  });

  const addQuestion = useMutation({
    mutationFn: (quizId: string) =>
      quizService.addQuestion(quizId, {
        text: newQuestion.text,
        type: newQuestion.type,
        options:
          newQuestion.type === 'ESSAY'
            ? undefined
            : newQuestion.options.split(',').map((o) => o.trim()),
        correctAnswer: newQuestion.type === 'ESSAY' ? undefined : newQuestion.correctAnswer,
        points: newQuestion.points,
        topic: newQuestion.topic || undefined,
      }),
    onSuccess: () => {
      setQuestionFormFor(null);
      setNewQuestion({
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: 'A,B,C,D',
        correctAnswer: 'A',
        points: 1,
        topic: '',
      });
    },
  });

  return {
    course,
    lessons,
    isLoading: isLoadingCourse || isLoadingLessons,
    
    lessonForm, setLessonForm,
    quizFormFor, setQuizFormFor,
    questionFormFor, setQuestionFormFor,
    editingLessonId, setEditingLessonId,
    
    newLesson, setNewLesson,
    newQuiz, setNewQuiz,
    newQuestion, setNewQuestion,
    
    updateCourse,
    createLesson,
    deleteLesson,
    updateLesson,
    reorderLessons,
    createQuiz,
    addQuestion,
  };
}
