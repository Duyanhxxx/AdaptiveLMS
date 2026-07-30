'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UserCircle, Trophy, BookOpen, Clock, Activity, Target, Flame, 
  Sparkles, Award, Heart, Bookmark, LayoutGrid, Settings, Bell, 
  Shield, Link2, Map, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/services/users.service';
import { gamificationService } from '@/services/gamification.service';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { TeacherProfileView } from '@/features/profile/teacher-profile-view';
import { AdminWorkspaceView } from '@/features/profile/admin-workspace-view';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  return `${Math.floor(diffInMonths / 12)} năm trước`;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'settings'>('overview');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: usersService.getMyProfile,
  });

  const { data: badgesData } = useQuery({
    queryKey: ['my-badges'],
    queryFn: gamificationService.getMyBadges,
  });

  const { data: certificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: gamificationService.getMyCertificates,
  });

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-2xl" />;
  }

  if (!profile) return <p className="text-destructive">Không tìm thấy thông tin</p>;

  if (profile.role === 'TEACHER') {
    return <TeacherProfileView profile={profile} />;
  }

  if (profile.role === 'ADMIN') {
    return <AdminWorkspaceView profile={profile} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý toàn diện tiến độ, thành tích, mục tiêu học tập và cài đặt cá nhân"
        icon={UserCircle}
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Sidebar: Avatar, Level, Stats */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <GlassCard className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-4xl font-bold text-white shadow-xl shadow-indigo-500/20">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{profile.email}</p>
              <Badge className="mt-3 font-bold" variant="primary">
                {profile.role}
              </Badge>
            </div>
          </GlassCard>

          {/* Gamification Rank Widget */}
          <GlassCard className="border border-amber-500/30 bg-amber-500/5 p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold text-sm">
              <Trophy className="h-4 w-4" /> Level {Math.floor((badgesData?.earned?.length || 0) * 100 / 300) + 1}
            </div>
            <p className="text-xs font-bold text-foreground">
              {((badgesData?.earned?.length || 0) * 100).toLocaleString()} / {((Math.floor((badgesData?.earned?.length || 0) * 100 / 300) + 1) * 300).toLocaleString()} XP (Kế tiếp: Level {Math.floor((badgesData?.earned?.length || 0) * 100 / 300) + 2})
            </p>
            <Progress value={(((badgesData?.earned?.length || 0) * 100) % 300) / 300 * 100} className="h-2 bg-amber-500/20" />
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
              <span>Novice</span>
              <span className="text-amber-500">Tiến trình</span>
              <span>Grandmaster</span>
            </div>
          </GlassCard>

          {profile.studentProfile && (
            <GlassCard className="space-y-4">
              <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-2">Learning Statistics</h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-xs font-medium text-foreground">
                  <Award className="mr-2 h-4 w-4 text-primary" /> Điểm trung bình
                </span>
                <span className="font-bold text-primary">
                  {Math.round(profile.studentProfile.averageScore)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-xs font-medium text-foreground">
                  <Flame className="mr-2 h-4 w-4 text-amber-500" /> Current Streak
                </span>
                <span className="font-bold text-amber-500">
                  {profile.studentProfile.learningStreak} ngày 🔥
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-xs font-medium text-foreground">
                  <Clock className="mr-2 h-4 w-4 text-emerald-500" /> Thời gian học
                </span>
                <span className="font-bold text-emerald-500">
                  {Math.round(profile.studentProfile.totalTimeSpent / 60)} giờ
                </span>
              </div>
            </GlassCard>
          )}

          {/* Mini Badge Collection Widget */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-xs text-foreground">Badge Collection</h3>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {badgesData?.earned.slice(0, 4).map((userBadge) => (
                <div key={userBadge.id} className="p-2 rounded-lg border border-border bg-card" title={userBadge.badge.name}>
                  <span className="text-xl">{userBadge.badge.icon}</span>
                </div>
              ))}
              {(!badgesData?.earned || badgesData.earned.length === 0) && (
                <p className="col-span-4 text-xs text-muted-foreground py-2">Chưa có huy hiệu nào.</p>
              )}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full text-[10px] mt-2 text-primary">
              <Link href="/achievements">Xem tất cả 40 Huy hiệu →</Link>
            </Button>
          </GlassCard>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* Custom Tabs */}
          <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto hide-scrollbar">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('overview')}
              className="text-xs font-semibold"
            >
              <LayoutGrid className="mr-1.5 h-4 w-4" /> Tổng quan
            </Button>
            <Button 
              variant={activeTab === 'learning' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('learning')}
              className="text-xs font-semibold"
            >
              <BookOpen className="mr-1.5 h-4 w-4" /> Dữ liệu Học tập
            </Button>
            <Button 
              variant={activeTab === 'settings' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('settings')}
              className="text-xs font-semibold"
            >
              <Settings className="mr-1.5 h-4 w-4" /> Cài đặt & Quyền riêng tư
            </Button>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Enrolled Courses & Completed */}
                <GlassCard>
                  <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-sm text-foreground">Tiến độ Khóa học</h3>
                    </div>
                  </div>
                  
                  {profile.enrollments?.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
                  ) : (
                    <div className="space-y-3">
                      {profile.enrollments?.map((e: any) => {
                        const progressPct = e.progress ? Math.round(e.progress) : 0;
                        return (
                          <div key={e.id} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-sm text-foreground">{e.course.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Khóa học có {e.course._count.lessons} bài học
                                </p>
                              </div>
                              <Badge variant={progressPct === 100 ? 'success' : 'default'} className="text-[9px]">
                                {progressPct === 100 ? 'Completed' : `${progressPct}%`}
                              </Badge>
                            </div>
                            <Progress value={progressPct} className="mt-3 h-1.5" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>

                {/* Certificates */}
                <GlassCard>
                  <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                    <Award className="h-5 w-5 text-amber-500" />
                    <h3 className="font-bold text-sm text-foreground">Chứng chỉ (Certificates)</h3>
                  </div>
                  
                  {!certificates || certificates.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">Chưa có chứng chỉ nào.</p>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center space-y-2">
                          <Award className="mx-auto h-8 w-8 text-amber-500 opacity-80" />
                          <div>
                            <p className="font-bold text-xs text-foreground">{cert.course.title} Certificate</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Cấp ngày: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          {cert.pdfUrl && (
                            <Button variant="outline" size="sm" className="h-7 text-[10px] mt-2 border-amber-500/30 text-amber-600" asChild>
                              <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">Tải xuống PDF</a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Activity Timeline */}
              <GlassCard>
                <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Activity Timeline</h3>
                </div>

                {profile.history?.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Chưa có hoạt động học tập nào.</p>
                ) : (
                  <div className="relative space-y-0 pl-4 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[2px] before:bg-border/60">
                    {profile.history?.slice(0, 5).map((h: any) => (
                      <div key={h.id} className="relative pb-5 pl-6 last:pb-0">
                        <div className="absolute left-[-21px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
                        <p className="text-xs font-bold text-foreground">
                          {h.action === 'LESSON_VIEWED' && 'Đã xem bài học'}
                          {h.action === 'LESSON_COMPLETED' && 'Hoàn thành bài học (+10 XP)'}
                          {h.action === 'QUIZ_STARTED' && 'Bắt đầu làm quiz'}
                          {h.action === 'QUIZ_SUBMITTED' && `Nộp quiz (Điểm: ${h.score ? Math.round(h.score) : 0}%)`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {h.action.includes('QUIZ') ? h.quiz?.title : h.lesson?.title}
                        </p>
                        <p className="mt-1 text-[9px] text-muted-foreground font-semibold">
                          {timeAgo(h.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {/* TAB: LEARNING DATA */}
          {activeTab === 'learning' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid gap-6 lg:grid-cols-2">
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <h3 className="font-bold text-sm text-foreground">Favorite Courses</h3>
                  </div>
                  <p className="text-xs text-muted-foreground text-center py-4">Chưa có khóa học yêu thích.</p>
                </GlassCard>

                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Bookmark className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-bold text-sm text-foreground">Saved/Bookmarked Lessons</h3>
                  </div>
                  <p className="text-xs text-muted-foreground text-center py-4">Chưa có bài học nào được lưu lại.</p>
                </GlassCard>
              </div>

              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Map className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">Learning Heatmap (Tần suất học tập)</h3>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col items-center justify-center opacity-60">
                  <div className="grid grid-cols-12 gap-1 mb-2">
                    {Array.from({length: 60}).map((_, i) => (
                      <div key={i} className={cn(
                        "w-3 h-3 rounded-sm", 
                        Math.random() > 0.7 ? "bg-emerald-500" : Math.random() > 0.5 ? "bg-emerald-500/40" : "bg-secondary"
                      )} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Hoạt động trong 60 ngày qua</p>
                </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Learning Goal & Preferences</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 border border-border rounded-lg bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">Mục tiêu hằng ngày</p>
                    <p className="font-bold text-sm text-foreground">Học 30 phút / ngày</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">Phong cách học</p>
                    <p className="font-bold text-sm text-foreground">Thích thực hành (Project-based)</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Notification Settings</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-xs font-bold text-foreground">Nhắc nhở học tập (Daily Reminder)</p>
                      <p className="text-[10px] text-muted-foreground">Nhận email nhắc nhở nếu chưa học trong ngày.</p>
                    </div>
                    <Badge variant="success">Bật</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-xs font-bold text-foreground">Thông báo Nhóm & Thảo luận</p>
                      <p className="text-[10px] text-muted-foreground">Khi có người reply hoặc thả tim bình luận.</p>
                    </div>
                    <Badge variant="success">Bật</Badge>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">Privacy & Security</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-xs font-bold text-foreground">Hiển thị trên Leaderboard</p>
                      <p className="text-[10px] text-muted-foreground">Cho phép người khác thấy XP của bạn.</p>
                    </div>
                    <Badge variant="success">Bật</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-xs font-bold text-foreground">Hồ sơ công khai (Public Profile)</p>
                      <p className="text-[10px] text-muted-foreground">Chia sẻ chứng chỉ và thành tích qua Link.</p>
                    </div>
                    <Badge variant="outline">Tắt</Badge>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Link2 className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold text-sm text-foreground">Connected Accounts</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-secondary rounded flex items-center justify-center font-bold text-[10px]">G</div>
                      <p className="text-xs font-bold text-foreground">Google (Đã liên kết)</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]">Hủy liên kết</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-secondary rounded flex items-center justify-center font-bold text-[10px]">GH</div>
                      <p className="text-xs font-bold text-foreground">GitHub (Chưa liên kết)</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]">Liên kết</Button>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
