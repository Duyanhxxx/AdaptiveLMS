'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ClipboardCheck, Search, Filter, AlertCircle, FileText, 
  CheckCircle2, XCircle, Clock, ChevronRight, MessageSquare 
} from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
// import { assignmentsService } from '@/services/assignments.service';

// Mock service temporarily until we create assignments.service.ts
const assignmentsService = {
  getPendingSubmissions: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/pending-grading`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to fetch pending submissions');
    return res.json();
  },
  gradeSubmission: async (id: string, data: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/submissions/${id}/grade`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to grade submission');
    return res.json();
  }
};

export function TeacherGradingView() {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [score, setScore] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['pending-grading'],
    queryFn: assignmentsService.getPendingSubmissions,
  });

  const gradeMutation = useMutation({
    mutationFn: (data: { id: string, score: number, feedback: string }) => 
      assignmentsService.gradeSubmission(data.id, { score: data.score, feedback: data.feedback }),
    onSuccess: () => {
      toast.success('Đã chấm điểm thành công!');
      queryClient.invalidateQueries({ queryKey: ['pending-grading'] });
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi chấm điểm.');
    }
  });

  const handleGrade = () => {
    if (score === '' || score < 0) {
      toast.error('Vui lòng nhập điểm hợp lệ');
      return;
    }
    gradeMutation.mutate({
      id: selectedSubmission.id,
      score: Number(score),
      feedback
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Chấm điểm & Đánh giá"
        description="Duyệt bài tập, chấm điểm và gửi phản hồi cho học viên"
        icon={ClipboardCheck}
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Submissions List */}
        <div className="md:col-span-5 lg:col-span-4 space-y-4">
          <GlassCard className="p-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm học viên..." 
                className="w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </GlassCard>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <p className="text-sm text-muted-foreground p-4 text-center">Đang tải dữ liệu...</p>
            ) : submissions.length === 0 ? (
              <GlassCard className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-50 mb-3" />
                <p>Không có bài tập nào cần chấm.</p>
              </GlassCard>
            ) : (
              submissions.map((sub: any) => (
                <GlassCard 
                  key={sub.id} 
                  className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${selectedSubmission?.id === sub.id ? 'border-primary ring-1 ring-primary/20 bg-secondary/30' : ''}`}
                  onClick={() => {
                    setSelectedSubmission(sub);
                    setScore('');
                    setFeedback('');
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-foreground truncate max-w-[200px]">
                      {sub.student.firstName} {sub.student.lastName}
                    </p>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">Chờ duyệt</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{sub.assignment.title}</p>
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> Nộp lúc {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Grading Interface */}
        <div className="md:col-span-7 lg:col-span-8">
          {!selectedSubmission ? (
            <GlassCard className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 opacity-20 mb-4" />
              <p>Chọn một bài tập bên trái để bắt đầu chấm điểm</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-0 overflow-hidden flex flex-col h-full">
              <div className="border-b border-border p-6 bg-secondary/10">
                <h2 className="text-xl font-bold text-foreground mb-1">{selectedSubmission.assignment.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Học viên: <strong className="text-foreground">{selectedSubmission.student.firstName} {selectedSubmission.student.lastName}</strong> ({selectedSubmission.student.email})</span>
                  <span>Điểm tối đa: <strong className="text-foreground">{selectedSubmission.assignment.maxScore}</strong></span>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="rounded-xl border border-border p-4 bg-card shadow-sm flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{selectedSubmission.fileName || 'bai_tap.pdf'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{(selectedSubmission.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                  <Button variant="outline" size="sm">Tải xuống</Button>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-bold text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Nhận xét & Đánh giá</h3>
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground">Điểm số (/{selectedSubmission.assignment.maxScore})</label>
                      <input 
                        type="number" 
                        value={score}
                        onChange={(e) => setScore(e.target.value ? Number(e.target.value) : '')}
                        max={selectedSubmission.assignment.maxScore}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-bold text-lg"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-xs font-semibold text-muted-foreground">Lời phê (Feedback)</label>
                      <textarea 
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Nhập nhận xét chi tiết để giúp học viên cải thiện..." 
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-4 bg-secondary/10 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Hủy</Button>
                <Button onClick={handleGrade} disabled={gradeMutation.isPending}>
                  {gradeMutation.isPending ? 'Đang lưu...' : 'Lưu Điểm & Gửi phản hồi'}
                </Button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
