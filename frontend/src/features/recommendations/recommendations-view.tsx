'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Calendar, Sparkles, Target } from 'lucide-react';
import { recommendationsService } from '@/services/recommendations.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import type { Recommendation } from '@/types';

function isRecommendation(
  data: Recommendation | { message: string },
): data is Recommendation {
  return 'id' in data;
}

export function RecommendationsView() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations-latest'],
    queryFn: recommendationsService.getLatest,
  });

  const generateMutation = useMutation({
    mutationFn: recommendationsService.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations-latest'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  const recommendation = data && isRecommendation(data) ? data : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gợi ý học tập AI"
        description="Lộ trình cá nhân hóa dựa trên kết quả học tập của bạn"
        icon={Sparkles}
        action={
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <Sparkles className="h-4 w-4" />
            {generateMutation.isPending ? 'Đang tạo...' : 'Tạo gợi ý mới'}
          </Button>
        }
      />

      {!recommendation ? (
        <GlassCard className="p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium">Chưa có gợi ý nào</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhấn &quot;Tạo gợi ý mới&quot; để nhận lộ trình học tập cá nhân hóa.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <GlassCard className="overflow-hidden p-0">
            <div className="bg-brand-gradient px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white">{recommendation.learningLevel}</Badge>
                {recommendation.studentGroup && (
                  <Badge className="bg-white/20 text-white">
                    {recommendation.studentGroup === 'EXCELLENT'
                      ? 'Nhóm xuất sắc'
                      : recommendation.studentGroup === 'NEEDS_SUPPORT'
                        ? 'Nhóm cần hỗ trợ'
                        : 'Nhóm trung bình'}
                  </Badge>
                )}
                {recommendation.strengths.map((s) => (
                  <Badge key={s} className="bg-emerald-500/30 text-white">
                    ✓ {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-6">
              {recommendation.groupStrategy && (
                <p className="mb-3 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
                  Chiến lược: {recommendation.groupStrategy}
                </p>
              )}
              <p className="text-lg font-semibold leading-relaxed">
                {recommendation.motivationalFeedback}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {recommendation.explanation}
              </p>
              {recommendation.weaknesses.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.weaknesses.map((w) => (
                    <Badge key={w} variant="destructive">
                      Cần cải thiện: {w}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {recommendation.recommendedLessons &&
            recommendation.recommendedLessons.length > 0 && (
              <GlassCard>
                <h3 className="mb-4 font-semibold">Bài học được đề xuất</h3>
                <div className="space-y-3">
                  {recommendation.recommendedLessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration} phút · {lesson.difficulty}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {lesson.topics.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/courses/${lesson.courseId}/lessons/${lesson.id}`}>
                          Học ngay
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Kế hoạch hàng ngày</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {recommendation.practicePlan.daily.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Mục tiêu tuần này</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {recommendation.practicePlan.weekly.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
