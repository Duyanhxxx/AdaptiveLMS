'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle, Reply, User, Calendar, Plus } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function TeacherEngagementView() {
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'Q&A' | 'SCHEDULE'>('Q&A');

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['teacher-discussions'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/teacher/unanswered`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch discussions');
      return res.json();
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (data: { lessonId: string; content: string; parentId: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discussions/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to reply');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Đã gửi câu trả lời!');
      queryClient.invalidateQueries({ queryKey: ['teacher-discussions'] });
      setReplyContent({});
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Gắn kết & Tương tác" description="Đang tải dữ liệu..." icon={MessageCircle} />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Gắn kết & Tương tác"
          description="Quản lý hỏi đáp (Q&A) và Lên lịch học Live cho sinh viên"
          icon={MessageCircle}
        />
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'Q&A' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('Q&A')}
          >
            Hỏi đáp & Thảo luận
          </Button>
          <Button 
            variant={activeTab === 'SCHEDULE' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('SCHEDULE')}
          >
            Lịch học (Schedule)
          </Button>
        </div>
      </div>

      {activeTab === 'Q&A' ? (
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <GlassCard className="p-8 text-center text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4 opacity-50" />
              <p>Tuyệt vời! Không có câu hỏi nào bị tồn đọng.</p>
            </GlassCard>
          ) : (
            discussions.map((comment: any) => (
              <GlassCard key={comment.id} className="p-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {comment.user.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-foreground">{comment.user.firstName} {comment.user.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          Khóa: <span className="font-semibold text-foreground/80">{comment.lesson.course.title}</span> - Bài: <span className="font-semibold text-foreground/80">{comment.lesson.title}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <p className="text-sm text-foreground bg-secondary/20 p-3 rounded-lg border border-border">
                      {comment.content}
                    </p>

                    {comment.replies?.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-border space-y-3">
                        {comment.replies.map((reply: any) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 text-xs font-bold">
                              {reply.user.firstName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-xs">{reply.user.firstName} {reply.user.role === 'TEACHER' && <span className="text-emerald-500">(Giáo viên)</span>}</p>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Input 
                        placeholder="Nhập câu trả lời..." 
                        value={replyContent[comment.id] || ''}
                        onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && replyContent[comment.id]) {
                            replyMutation.mutate({
                              lessonId: comment.lessonId,
                              content: replyContent[comment.id],
                              parentId: comment.id
                            });
                          }
                        }}
                      />
                      <Button 
                        disabled={!replyContent[comment.id] || replyMutation.isPending}
                        onClick={() => replyMutation.mutate({
                          lessonId: comment.lessonId,
                          content: replyContent[comment.id],
                          parentId: comment.id
                        })}
                      >
                        <Reply className="mr-2 h-4 w-4" /> Trả lời
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      ) : (
        <GlassCard className="p-8 text-center text-muted-foreground">
          <Calendar className="mx-auto h-16 w-16 text-primary mb-4 opacity-20" />
          <h3 className="text-lg font-bold text-foreground mb-2">Quản lý Lịch học Live</h3>
          <p className="max-w-md mx-auto mb-6">Tạo sự kiện, gắn link Zoom hoặc Google Meet để học viên nắm được lịch học tương tác trực tuyến.</p>
          <Button onClick={() => toast.success('Tính năng Lên lịch Zoom sẽ được ra mắt ở phiên bản sau!')}>
            <Plus className="mr-2 h-4 w-4" /> Lên lịch Live Session
          </Button>
        </GlassCard>
      )}
    </div>
  );
}
