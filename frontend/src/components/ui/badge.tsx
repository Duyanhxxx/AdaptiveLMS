import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  outline: 'border border-border text-foreground',
} as const;

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
