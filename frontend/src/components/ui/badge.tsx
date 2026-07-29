import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-secondary/80 text-secondary-foreground border border-border/50',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  destructive: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  outline: 'border border-border text-foreground bg-card',
} as const;

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
