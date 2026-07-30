'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileQuestion, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function CreateQuizView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }
  ]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Create quiz then add questions (mock fetch)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`,
        },
        body: JSON.stringify({ lessonId, title, description }),
      });
      if (!res.ok) throw new Error('Failed to create quiz');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Đã xuất bản Quiz thành công!');
      queryClient.invalidateQueries({ queryKey: ['quizzes', lessonId] });
      router.back();
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`,
        },
        body: JSON.stringify({ 
          topic: title || 'Tổng hợp kiến thức khóa học', 
          description: description || 'Kiểm tra trắc nghiệm khách quan',
          count: 5 
        }),
      });
      if (!res.ok) throw new Error('AI failed');
      return res.json();
    },
    onSuccess: (data) => {
      setQuestions(data);
      toast.success('AI đã tạo xong ngân hàng câu hỏi!');
    },
    onError: () => toast.error('AI gặp sự cố, vui lòng thử lại sau'),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Trình Tạo Trắc Nghiệm (Quiz Builder)"
          description="Thiết kế bài kiểm tra trắc nghiệm hoặc sử dụng AI để tự động tạo"
          icon={FileQuestion}
        />
        <Button 
          variant="outline" 
          className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => aiMutation.mutate()}
          disabled={aiMutation.isPending}
        >
          <Sparkles className="mr-2 h-4 w-4" /> 
          {aiMutation.isPending ? 'AI Đang suy nghĩ...' : 'AI Generate'}
        </Button>
      </div>

      <GlassCard className="p-8 space-y-6">
        <div className="space-y-4 border-b border-border/50 pb-6">
          <div className="space-y-2">
            <Label className="font-bold text-foreground">Tiêu đề Bài kiểm tra</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="VD: Kiểm tra kiến thức chương 1" 
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-foreground">Mô tả ngắn</Label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Bài kiểm tra 15 phút..." 
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" /> Danh sách Câu hỏi
          </h3>
          
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 rounded-xl border border-border bg-secondary/20 relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-xs text-muted-foreground">Câu hỏi {qIndex + 1}</Label>
                  <Input 
                    value={q.text} 
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[qIndex].text = e.target.value;
                      setQuestions(newQ);
                    }}
                    placeholder="Nhập nội dung câu hỏi..." 
                    className="font-semibold"
                  />
                </div>
                
                <div className="grid gap-3 pl-4 border-l-2 border-primary/20">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={`q-${qIndex}`} 
                        checked={q.correctIndex === oIndex}
                        onChange={() => {
                          const newQ = [...questions];
                          newQ[qIndex].correctIndex = oIndex;
                          setQuestions(newQ);
                        }}
                        className="h-4 w-4 text-primary" 
                      />
                      <Input 
                        value={opt} 
                        onChange={(e) => {
                          const newQ = [...questions];
                          newQ[qIndex].options[oIndex] = e.target.value;
                          setQuestions(newQ);
                        }}
                        placeholder={`Đáp án ${String.fromCharCode(65 + oIndex)}`}
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={() => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, points: 1 }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
          </Button>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
          <Button variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title}>
            <Save className="mr-2 h-4 w-4" /> Xuất bản Quiz
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
