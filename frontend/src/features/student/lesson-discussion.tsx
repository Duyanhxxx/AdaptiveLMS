'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Heart, Flame, ThumbsUp, Sparkles, Send, Reply, User } from 'lucide-react';
import { discussionsService } from '@/services/discussions.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';
import { cn } from '@/lib/utils';

const reactionTypes = [
  { type: 'LIKE', emoji: '👍', icon: ThumbsUp, label: 'Thích' },
  { type: 'HEART', emoji: '❤️', icon: Heart, label: 'Yêu thích' },
  { type: 'FIRE', emoji: '🔥', icon: Flame, label: 'Tuyệt vời' },
  { type: 'CLAP', emoji: '👏', icon: Sparkles, label: 'Vỗ tay' },
];

export function LessonDiscussion({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: comments, isLoading: loadingComments } = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: () => discussionsService.getComments(lessonId),
  });

  const { data: reactions } = useQuery({
    queryKey: ['lesson-reactions', lessonId],
    queryFn: () => discussionsService.getReactions(lessonId),
  });

  const addCommentMutation = useMutation({
    mutationFn: discussionsService.addComment,
    onSuccess: () => {
      setCommentText('');
      setReplyToId(null);
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: discussionsService.toggleReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-reactions', lessonId] });
    },
  });

  return (
    <div className="space-y-6 pt-4">
      {/* Reactions Bar */}
      <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Cảm xúc bài học & Thảo luận</h3>
        </div>
        <div className="flex items-center gap-2">
          {reactionTypes.map((r) => {
            const count = reactions?.counts?.[r.type] ?? 0;
            const isMyReaction = reactions?.myReactions?.includes(r.type);
            return (
              <button
                key={r.type}
                type="button"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none active:scale-95',
                  isMyReaction
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border bg-card hover:bg-secondary text-foreground',
                )}
                onClick={() => toggleReactionMutation.mutate({ lessonId, type: r.type })}
              >
                <span>{r.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Main Add Comment Box */}
      <GlassCard className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Viết bình luận hoặc câu hỏi của bạn
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Chia sẻ cảm nghĩ hoặc đặt câu hỏi bài học..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                addCommentMutation.mutate({ lessonId, content: commentText });
              }
            }}
          />
          <Button
            disabled={!commentText.trim() || addCommentMutation.isPending}
            onClick={() => addCommentMutation.mutate({ lessonId, content: commentText })}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Comments List */}
      <div className="space-y-4">
        {loadingComments ? (
          <p className="text-xs text-muted-foreground text-center py-4">Đang tải thảo luận...</p>
        ) : comments?.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
          </GlassCard>
        ) : (
          comments?.map((c) => (
            <GlassCard key={c.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {c.user.firstName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground">
                        {c.user.firstName} {c.user.lastName}
                      </p>
                      <Badge variant="outline" className="text-[9px]">
                        {c.user.role}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Trả lời
                </Button>
              </div>

              <p className="text-xs text-foreground/90 pl-10 whitespace-pre-wrap">{c.content}</p>

              {/* Reply Box */}
              {replyToId === c.id && (
                <div className="pl-10 pt-2 flex gap-2">
                  <Input
                    className="h-8 text-xs"
                    placeholder="Viết câu trả lời..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    disabled={!replyText.trim() || addCommentMutation.isPending}
                    onClick={() => addCommentMutation.mutate({ lessonId, content: replyText, parentId: c.id })}
                  >
                    Gửi
                  </Button>
                </div>
              )}

              {/* Nested Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="pl-10 pt-2 space-y-2 border-t border-border/40">
                  {c.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2.5 bg-secondary/30 p-2.5 rounded-lg">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                        {reply.user.firstName[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-foreground">
                          {reply.user.firstName} {reply.user.lastName}
                        </p>
                        <p className="text-xs text-foreground/90 mt-0.5">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
