'use client';

import { useState } from 'react';
import { GradingQueue } from '@/features/teacher/grading-queue';
import { TeacherGradingView } from '@/features/grading/teacher-grading-view';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardCheck } from 'lucide-react';

export default function TeacherGradingPage() {
  const [mode, setMode] = useState<'ESSAY' | 'ASSIGNMENT'>('ASSIGNMENT');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex gap-2 border-b border-border pb-2">
        <Button 
          variant={mode === 'ASSIGNMENT' ? 'default' : 'ghost'} 
          onClick={() => setMode('ASSIGNMENT')}
          className="font-semibold"
        >
          <FileText className="mr-2 h-4 w-4" /> Chấm Bài Tập (Assignments)
        </Button>
        <Button 
          variant={mode === 'ESSAY' ? 'default' : 'ghost'} 
          onClick={() => setMode('ESSAY')}
          className="font-semibold"
        >
          <ClipboardCheck className="mr-2 h-4 w-4" /> Chấm Tự Luận (Quiz Essays)
        </Button>
      </div>

      {mode === 'ASSIGNMENT' ? <TeacherGradingView /> : <GradingQueue />}
    </div>
  );
}
