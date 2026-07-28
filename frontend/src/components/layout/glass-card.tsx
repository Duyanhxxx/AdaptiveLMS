import { cn } from '@/lib/utils';

interface GlassCardProps extends React.ComponentProps<'div'> {
  hover?: boolean;
}

export function GlassCard({
  className,
  hover = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6',
        hover && 'card-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
