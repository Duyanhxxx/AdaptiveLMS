'use client';

import { Trophy, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillNode {
  id: string;
  name: string;
  level: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';
  progress: number;
  icon: string;
}

const defaultSkillNodes: SkillNode[] = [
  { id: '1', name: 'Nền tảng HTML & CSS', level: 'MASTERED', progress: 100, icon: '🌐' },
  { id: '2', name: 'JavaScript ES6+', level: 'MASTERED', progress: 100, icon: '⚡' },
  { id: '3', name: 'React Component & State', level: 'IN_PROGRESS', progress: 75, icon: '⚛️' },
  { id: '4', name: 'Next.js App Router', level: 'IN_PROGRESS', progress: 45, icon: '▲' },
  { id: '5', name: 'Tích hợp AI & REST API', level: 'LOCKED', progress: 0, icon: '🤖' },
  { id: '6', name: 'Full-stack System Architecture', level: 'LOCKED', progress: 0, icon: '🏗️' },
];

export function SkillTree({ strongTopics = [], weakTopics = [] }: { strongTopics?: string[]; weakTopics?: string[] }) {
  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="font-bold text-base text-foreground">Sơ đồ Cây kỹ năng (Skill Tree Roadmap)</h3>
        </div>
        <Badge variant="primary" className="text-[10px]">
          Duolingo-style Competency
        </Badge>
      </div>

      {/* Nodes Map */}
      <div className="relative space-y-6 py-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {defaultSkillNodes.map((node) => {
            const isMastered = node.level === 'MASTERED';
            const isInProgress = node.level === 'IN_PROGRESS';
            const isLocked = node.level === 'LOCKED';

            return (
              <div
                key={node.id}
                className={cn(
                  'relative rounded-xl border p-4 transition-all duration-200 bg-card',
                  isMastered && 'border-emerald-500/40 bg-emerald-500/5 shadow-xs',
                  isInProgress && 'border-primary ring-1 ring-primary/20 shadow-sm',
                  isLocked && 'border-border/60 opacity-60 bg-secondary/20',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{node.icon}</span>
                  {isMastered && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {isInProgress && <Sparkles className="h-5 w-5 text-primary animate-pulse" />}
                  {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                </div>

                <p className="mt-3 font-bold text-xs text-foreground">{node.name}</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Tiến độ kỹ năng:</span>
                  <span className="font-bold text-foreground">{node.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isMastered ? 'bg-emerald-500' : isInProgress ? 'bg-primary' : 'bg-muted',
                    )}
                    style={{ width: `${node.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
