import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/layout/glass-card';

interface TopicListProps {
  title: string;
  topics: string[];
  variant: 'success' | 'destructive';
  emptyText: string;
}

export function TopicList({ title, topics, variant, emptyText }: TopicListProps) {
  return (
    <GlassCard>
      <h3 className="mb-4 font-semibold">{title}</h3>
      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge key={topic} variant={variant === 'success' ? 'success' : 'destructive'}>
              {topic}
            </Badge>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
