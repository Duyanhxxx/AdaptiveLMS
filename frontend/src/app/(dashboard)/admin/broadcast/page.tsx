'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Megaphone, Send, CheckCircle2 } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
  });
  const [success, setSuccess] = useState(false);

  const broadcastMutation = useMutation({
    mutationFn: notificationsService.broadcast,
    onSuccess: () => {
      setSuccess(true);
      setForm({ title: '', message: '', type: 'INFO' });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gửi thông báo toàn hệ thống"
        description="Gửi thông báo bảo trì, cập nhật tính năng cho toàn bộ người dùng"
        icon={Megaphone}
      />

      <GlassCard className="max-w-2xl">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            broadcastMutation.mutate(form);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              placeholder="VD: Cập nhật hệ thống tối nay"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loại thông báo</Label>
            <select
              id="type"
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="INFO">Thông tin (Info)</option>
              <option value="WARNING">Cảnh báo (Warning)</option>
              <option value="SUCCESS">Thành công (Success)</option>
              <option value="RECOMMENDATION">Khuyến nghị (Recommendation)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Nội dung chi tiết</Label>
            <textarea
              id="message"
              className="min-h-32 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Nhập nội dung thông báo..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={broadcastMutation.isPending || !form.title || !form.message}
            >
              {broadcastMutation.isPending ? (
                'Đang gửi...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi thông báo (Broadcast)
                </>
              )}
            </Button>
            {success && (
              <p className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Đã gửi thành công!
              </p>
            )}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
