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
        'glass-card rounded-xl p-6 transition-all duration-200',
        hover && 'card-hover cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
