export type StudentGroup = 'EXCELLENT' | 'AVERAGE' | 'NEEDS_SUPPORT';

export interface StudentGroupMeta {
  key: StudentGroup;
  label: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export const STUDENT_GROUPS: StudentGroupMeta[] = [
  {
    key: 'EXCELLENT',
    label: 'Nhóm xuất sắc',
    description: 'Nắm bắt nhanh, cần thử thách cao hơn',
    minScore: 80,
    maxScore: 100,
  },
  {
    key: 'AVERAGE',
    label: 'Nhóm trung bình',
    description: 'Phong độ ổn định, cần điểm bứt phá',
    minScore: 50,
    maxScore: 79.99,
  },
  {
    key: 'NEEDS_SUPPORT',
    label: 'Nhóm cần hỗ trợ',
    description: 'Mất gốc, cần động viên và hướng dẫn chi tiết',
    minScore: 0,
    maxScore: 49.99,
  },
];

export function classifyStudentGroup(averageScore: number): StudentGroup {
  if (averageScore >= 80) return 'EXCELLENT';
  if (averageScore >= 50) return 'AVERAGE';
  return 'NEEDS_SUPPORT';
}

export function getGroupMeta(group: StudentGroup): StudentGroupMeta {
  return STUDENT_GROUPS.find((g) => g.key === group)!;
}
