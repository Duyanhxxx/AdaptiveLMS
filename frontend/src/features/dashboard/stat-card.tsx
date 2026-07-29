import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const iconColors: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  color?: keyof typeof iconColors;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'indigo',
}: StatCardProps) {
  return (
    <div className="glass-card card-hover rounded-xl p-5 border border-border bg-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border shadow-xs',
            iconColors[color],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {trend && (
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
              trend.startsWith('+')
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                : 'bg-secondary text-muted-foreground border border-border',
            )}
          >
            {trend}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
