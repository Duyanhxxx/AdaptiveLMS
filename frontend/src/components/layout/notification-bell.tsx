'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.listMine,
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const unread = countData?.count ?? 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border/60 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <p className="font-semibold">Thông báo</p>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck className="h-3 w-3" />
                  Đọc tất cả
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!notifications?.length ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Không có thông báo
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      'w-full border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                      !n.isRead && 'bg-primary/5',
                    )}
                    onClick={() => {
                      if (!n.isRead) markRead.mutate(n.id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {n.type}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
