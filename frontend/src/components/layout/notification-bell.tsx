'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeIcons = {
  INFO: Info,
  WARNING: AlertTriangle,
  SUCCESS: CheckCircle,
  RECOMMENDATION: Sparkles,
};

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
        className="relative hover:bg-secondary rounded-lg"
        onClick={() => setOpen(!open)}
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-[100] mt-2 w-88 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-foreground">Thông báo</p>
                {unread > 0 && (
                  <Badge variant="primary" className="text-[10px]">
                    {unread} mới
                  </Badge>
                )}
              </div>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck className="mr-1 h-3.5 w-3.5" />
                  Đọc tất cả
                </Button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-border/40">
              {!notifications?.length ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Không có thông báo mới nào</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcons[n.type] ?? Info;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'group flex items-start gap-3 p-3.5 transition-colors hover:bg-secondary/60 cursor-pointer',
                        !n.isRead && 'bg-primary/5',
                      )}
                      onClick={() => {
                        if (!n.isRead) markRead.mutate(n.id);
                      }}
                    >
                      <div className="mt-0.5 shrink-0 rounded-md p-1.5 bg-secondary text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
