'use client';

import { useState } from 'react';
import { Flame, Clock, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DailyReminderBanner({ streak = 3 }: { streak?: number }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 pr-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 font-bold text-xl">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Nhắc nhở học tập hằng ngày
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Streak: {streak} ngày
              </span>
            </div>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              Bạn chưa học bài nào trong hôm nay. Đừng để đứt chuỗi Streak nhé!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/courses">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm">
              Học 15 phút ngay
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
          <button
            type="button"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground p-1"
            onClick={() => setDismissed(true)}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
