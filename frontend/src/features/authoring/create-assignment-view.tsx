'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Save, CheckCircle, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CreateAssignmentView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxScore: 100,
    dueDate: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`,
        },
        body: JSON.stringify({ ...data, lessonId }),
      });
      if (!res.ok) throw new Error('Failed to create assignment');
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      toast.success('Tạo bài tập thành công!');
      queryClient.invalidateQueries({ queryKey: ['assignments', lessonId] });
      router.back();
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo bài tập'),
  });

  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`,
        },
        body: JSON.stringify({ 
          topic: formData.title || 'Phát triển ứng dụng Web', 
        }),
      });
      if (!res.ok) throw new Error('AI failed');
      return res.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
      }));
      toast.success('AI đã thiết kế xong bài tập!');
    },
    onError: () => toast.error('AI gặp sự cố, vui lòng thử lại sau'),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Tạo Bài Tập Mới (Assignment)"
          description="Giao bài tập tự luận hoặc yêu cầu nộp file cho học viên"
          icon={FileText}
        />
        <Button 
          variant="outline" 
          className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => aiMutation.mutate()}
          disabled={aiMutation.isPending}
        >
          <Sparkles className="mr-2 h-4 w-4" /> 
          {aiMutation.isPending ? 'AI Đang viết đề...' : 'AI Generate'}
        </Button>
      </div>

      <GlassCard className="p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-semibold text-foreground">Tiêu đề Bài tập</Label>
          <Input 
            id="title" 
            placeholder="VD: Phân tích ưu nhược điểm của React" 
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="font-semibold text-foreground">Mô tả & Yêu cầu</Label>
          <textarea
            id="description"
            rows={6}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Nhập chi tiết yêu cầu bài tập..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxScore" className="font-semibold text-foreground">Điểm tối đa</Label>
            <Input 
              id="maxScore" 
              type="number"
              min={1}
              value={formData.maxScore}
              onChange={(e) => setFormData(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="font-semibold text-foreground">Hạn nộp (Không bắt buộc)</Label>
            <Input 
              id="dueDate" 
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button 
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending || !formData.title || !formData.description}
          >
            {mutation.isPending ? 'Đang lưu...' : <><Save className="mr-2 h-4 w-4" /> Xuất bản Bài tập</>}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
