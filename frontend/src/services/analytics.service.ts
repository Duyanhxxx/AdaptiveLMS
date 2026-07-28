import { apiClient } from './api-client';
import type { AdminDashboard, StudentDashboard, StudentGroupsDetail, TeacherDashboard } from '@/types';

export const analyticsService = {
  getStudentDashboard: () =>
    apiClient<StudentDashboard>('/analytics/student/dashboard'),

  getTeacherDashboard: () =>
    apiClient<TeacherDashboard>('/analytics/teacher/dashboard'),

  getStudentGroups: () =>
    apiClient<StudentGroupsDetail>('/analytics/teacher/student-groups'),

  getAdminDashboard: () =>
    apiClient<AdminDashboard>('/analytics/admin/dashboard'),
};
