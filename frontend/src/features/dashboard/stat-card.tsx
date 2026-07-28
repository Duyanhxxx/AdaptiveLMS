import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const iconColors: Record<string, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
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
    <div className="glass-card card-hover rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconColors[color],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              trend.startsWith('+')
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
