import { classifyStudentGroup, STUDENT_GROUPS } from './student-group.util';

describe('Student Group Classification', () => {
  it('classifies excellent students (>= 80)', () => {
    expect(classifyStudentGroup(85)).toBe('EXCELLENT');
    expect(classifyStudentGroup(80)).toBe('EXCELLENT');
  });

  it('classifies average students (50-79)', () => {
    expect(classifyStudentGroup(65)).toBe('AVERAGE');
    expect(classifyStudentGroup(50)).toBe('AVERAGE');
    expect(classifyStudentGroup(79)).toBe('AVERAGE');
  });

  it('classifies students needing support (< 50)', () => {
    expect(classifyStudentGroup(49)).toBe('NEEDS_SUPPORT');
    expect(classifyStudentGroup(0)).toBe('NEEDS_SUPPORT');
  });

  it('has 3 defined groups', () => {
    expect(STUDENT_GROUPS).toHaveLength(3);
  });
});
