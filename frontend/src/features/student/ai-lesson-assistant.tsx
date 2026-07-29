'use client';

import { useState } from 'react';
import { Sparkles, Send, Bot, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/layout/glass-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function AiLessonAssistant({ lessonTitle, lessonContent }: { lessonTitle: string; lessonContent: string }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ lý AI bài học. Bạn có thắc mắc gì về bài "${lessonTitle}" không? Hãy đặt câu hỏi cho tôi nhé!`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const query = input;
    setInput('');
    setLoading(true);

    // Simulate intelligent AI explanation based on lesson content
    setTimeout(() => {
      let replyText = `Dựa trên bài học "${lessonTitle}": `;
      if (query.toLowerCase().includes('tóm tắt') || query.toLowerCase().includes(' tóm tắt')) {
        replyText += `Nội dung chính bao gồm các điểm cốt lõi sau: 1) Khái niệm nền tảng. 2) Ứng dụng thực tế. 3) Các lưu ý quan trọng khi làm bài test.`;
      } else if (query.toLowerCase().includes('ví dụ') || query.toLowerCase().includes('ví dụ')) {
        replyText += `Ví dụ thực tế cho bài học này: Hãy hình dung bạn áp dụng khái niệm ${lessonTitle} vào xử lý bài toán thực tế theo từng bước nhỏ.`;
      } else {
        replyText += `Câu hỏi "${query}" rất hay! Trong bài học này, trọng tâm cần nhớ là: ${lessonContent.slice(0, 150)}... Bạn có muốn luyện tập thêm dạng câu hỏi này không?`;
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: replyText },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!open && (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Hỏi AI Bài học</span>
        </button>
      )}

      {/* AI Chat Drawer / Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">AI Tutor Assistant</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{lessonTitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-secondary/10">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex items-start gap-2 text-xs', m.sender === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary border text-foreground',
                  )}
                >
                  {m.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-3 py-2 leading-relaxed',
                    m.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border text-foreground shadow-xs rounded-tl-none',
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bot className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>AI đang suy nghĩ lời giải thích...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1.5 p-2 bg-card border-t border-border/40 overflow-x-auto">
            <button
              type="button"
              className="text-[11px] font-medium px-2 py-1 rounded bg-secondary hover:bg-primary/10 hover:text-primary shrink-0 transition-colors"
              onClick={() => {
                setInput('Tóm tắt ý chính bài học này');
              }}
            >
              💡 Tóm tắt ý chính
            </button>
            <button
              type="button"
              className="text-[11px] font-medium px-2 py-1 rounded bg-secondary hover:bg-primary/10 hover:text-primary shrink-0 transition-colors"
              onClick={() => {
                setInput('Cho tôi 1 ví dụ minh họa');
              }}
            >
              📝 Ví dụ minh họa
            </button>
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 p-3 bg-card border-t border-border">
            <Input
              className="h-9 text-xs"
              placeholder="Đặt câu hỏi về bài học..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="sm" className="h-9 w-9 shrink-0 p-0" onClick={handleSend} disabled={!input.trim() || loading}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
