'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, Trophy, Lock, CheckCircle2, Sparkles, Star, Search, Flame } from 'lucide-react';
import { analyticsService } from '@/services/analytics.service';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { gamificationService } from '@/services/gamification.service';

const rarityStyles = {
  COMMON: 'border-border bg-card text-foreground',
  RARE: 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  EPIC: 'border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-400',
  LEGENDARY: 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [search, setSearch] = useState('');

  const { data: dashboard, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: analyticsService.getStudentDashboard,
  });

  const { data: badgesData, isLoading: isLoadingBadges } = useQuery({
    queryKey: ['my-badges'],
    queryFn: gamificationService.getMyBadges,
  });

  if (isLoadingDashboard || isLoadingBadges) return <Skeleton className="h-[600px] w-full rounded-xl" />;

  const earnedIds = new Set(badgesData?.earned.map((ub) => ub.badgeId) || []);

  const badgeCollection = badgesData?.all.map((badge) => {
    // Determine rarity mock based on category
    let rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'COMMON';
    let xp = 50;
    if (badge.category === 'ACHIEVEMENT') { rarity = 'EPIC'; xp = 500; }
    if (badge.category === 'SPECIAL') { rarity = 'LEGENDARY'; xp = 1000; }
    if (badge.category === 'SOCIAL') { rarity = 'RARE'; xp = 200; }

    return {
      ...badge,
      rarity,
      xp,
      unlocked: earnedIds.has(badge.id)
    };
  }) || [];

  const filteredBadges = badgeCollection.filter((b) => {
    if (filter === 'UNLOCKED' && !b.unlocked) return false;
    if (filter === 'LOCKED' && b.unlocked) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unlockedCount = badgesData?.earned.length || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bộ sưu tập Thành tích & Huy hiệu"
        description="Mở khóa các danh hiệu cao quý, tích lũy XP và khẳng định năng lực học tập"
        icon={Trophy}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold text-2xl">
            🏆
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Huy hiệu đã mở khóa</p>
            <p className="text-2xl font-bold text-foreground">
              {unlockedCount} / {badgeCollection.length}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-2xl">
            ⚡
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng điểm thưởng XP</p>
            <p className="text-2xl font-bold text-primary">
              {badgeCollection.filter(b => b.unlocked).reduce((sum, b) => sum + b.xp, 0).toLocaleString()} XP
            </p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-2xl">
            🔥
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cấp độ hiện tại</p>
            <p className="text-2xl font-bold text-emerald-500">
              Level {Math.floor(badgeCollection.filter(b => b.unlocked).reduce((sum, b) => sum + b.xp, 0) / 300) + 1}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Filter & Search Controls */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ALL')}
          >
            Tất cả ({badgeCollection.length})
          </Button>
          <Button
            variant={filter === 'UNLOCKED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('UNLOCKED')}
          >
            Đã mở khóa ({unlockedCount})
          </Button>
          <Button
            variant={filter === 'LOCKED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('LOCKED')}
          >
            Chưa mở khóa ({badgeCollection.length - unlockedCount})
          </Button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm huy hiệu..."
            className="pl-9 h-9 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Badges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              'relative rounded-xl border p-5 transition-all duration-200 bg-card flex flex-col justify-between',
              rarityStyles[badge.rarity],
              !badge.unlocked && 'opacity-60 grayscale-[40%]',
            )}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{badge.icon}</span>
                <Badge
                  variant={badge.unlocked ? 'success' : 'outline'}
                  className="text-[9px] uppercase font-bold"
                >
                  {badge.rarity}
                </Badge>
              </div>

              <h4 className="mt-3 font-bold text-sm text-foreground">{badge.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-amber-500 font-bold">+{badge.xp} XP</span>
              {badge.unlocked ? (
                <span className="flex items-center text-emerald-500 font-bold text-[10px]">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Đã mở
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground text-[10px]">
                  <Lock className="mr-1 h-3.5 w-3.5" /> Khóa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
