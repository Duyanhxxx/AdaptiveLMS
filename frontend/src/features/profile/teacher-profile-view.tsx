import { useState } from 'react';
import { 
  UserCircle, Trophy, BookOpen, Clock, Users, Star, StarHalf,
  Award, Shield, FileText, Settings, BadgeCheck, CheckCircle2,
  CalendarDays, PlusCircle, ArrowRight
} from 'lucide-react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TeacherProfileViewProps {
  profile: any;
}

export function TeacherProfileView({ profile }: TeacherProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'reviews'>('overview');
  
  const teacherInfo = profile.teacherProfile || {};
  const stats = profile.teacherStats || {
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    courses: []
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Instructor Professional Dashboard"
        description="Quản lý hồ sơ giảng viên, theo dõi chỉ số khóa học và phản hồi từ học viên"
        icon={BadgeCheck}
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Sidebar: Avatar, Bio, Expertise */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <GlassCard className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-500/10 text-4xl font-bold text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10 border-4 border-card">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-emerald-500 p-1.5 border-4 border-card" title="Verified Instructor">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {teacherInfo.specialization || 'Giảng viên chuyên môn'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground w-full justify-center pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {teacherInfo.followers?.toLocaleString() || 0} Followers
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="h-4 w-4 fill-current" /> {teacherInfo.averageRating || '5.0'}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-2">Giới thiệu (Bio)</h3>
            <p className="text-sm text-foreground leading-relaxed">
              {teacherInfo.bio || 'Chưa cập nhật thông tin giới thiệu.'}
            </p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-3">Chuyên môn & Kỹ năng</h3>
            <div className="flex flex-wrap gap-2">
              {teacherInfo.expertise?.length > 0 ? (
                teacherInfo.expertise.map((exp: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="font-semibold text-[11px] bg-secondary border-border/40">
                    {exp}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Chưa có kỹ năng nổi bật</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="font-bold text-xs uppercase text-muted-foreground tracking-wider mb-3">Học vấn & Chứng chỉ</h3>
            <div className="space-y-3">
              {teacherInfo.education && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-xs text-foreground font-medium">{teacherInfo.education}</p>
                </div>
              )}
              {teacherInfo.certifications?.map((cert: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <Award className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-xs text-foreground font-medium">{cert}</p>
                </div>
              ))}
            </div>
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
              <FileText className="mr-1.5 h-4 w-4" /> Tổng quan
            </Button>
            <Button 
              variant={activeTab === 'courses' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('courses')}
              className="text-xs font-semibold"
            >
              <BookOpen className="mr-1.5 h-4 w-4" /> Khóa học & Thống kê
            </Button>
            <Button 
              variant={activeTab === 'reviews' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveTab('reviews')}
              className="text-xs font-semibold"
            >
              <Star className="mr-1.5 h-4 w-4" /> Đánh giá (Reviews)
            </Button>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Teacher Stats KPI */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <GlassCard className="p-4 flex items-center gap-3 bg-indigo-500/5 border-indigo-500/20">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Học viên</p>
                    <p className="text-xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-3 bg-emerald-500/5 border-emerald-500/20">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Khóa học</p>
                    <p className="text-xl font-bold text-foreground">{stats.totalCourses}</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-3 bg-amber-500/5 border-amber-500/20">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Đánh giá TB</p>
                    <p className="text-xl font-bold text-foreground">{teacherInfo.averageRating || '5.0'}</p>
                  </div>
                </GlassCard>
                <GlassCard className="p-4 flex items-center gap-3 bg-purple-500/5 border-purple-500/20">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Kinh nghiệm</p>
                    <p className="text-xl font-bold text-foreground">{teacherInfo.teachingExperience || 0} năm</p>
                  </div>
                </GlassCard>
              </div>

              {/* Achievements & Instructor Badges */}
              <GlassCard>
                <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">Danh hiệu & Khen thưởng Giảng viên</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                    <div className="text-4xl">👑</div>
                    <p className="font-bold text-xs">Top 1% Instructor</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                    <div className="text-4xl">🌟</div>
                    <p className="font-bold text-xs">1,000+ Học viên</p>
                  </div>
                  <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
                    <div className="text-4xl">🔥</div>
                    <p className="font-bold text-xs">Phản hồi siêu tốc</p>
                  </div>
                  <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-2">
                    <div className="text-4xl">💎</div>
                    <p className="font-bold text-xs">Khóa học Xuất sắc</p>
                  </div>
                </div>
              </GlassCard>

              {/* Recent Activity Timeline */}
              <GlassCard>
                <div className="mb-4 flex items-center gap-2 border-b border-border/60 pb-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Hoạt động Gần đây</h3>
                </div>
                <div className="space-y-4 pl-2">
                  <div className="relative pl-6 border-l-2 border-primary/30 py-1">
                    <div className="absolute left-[-5px] top-2 h-2 w-2 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground font-semibold">Hôm qua</p>
                    <p className="text-sm font-bold text-foreground mt-1">Xuất bản khóa học: Master React 2026</p>
                  </div>
                  <div className="relative pl-6 border-l-2 border-amber-500/30 py-1">
                    <div className="absolute left-[-5px] top-2 h-2 w-2 rounded-full bg-amber-500" />
                    <p className="text-xs text-muted-foreground font-semibold">3 ngày trước</p>
                    <p className="text-sm font-bold text-foreground mt-1">Nhận giải thưởng "Top 1% Instructor"</p>
                  </div>
                  <div className="relative pl-6 border-l-2 border-emerald-500/30 py-1">
                    <div className="absolute left-[-5px] top-2 h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-xs text-muted-foreground font-semibold">1 tuần trước</p>
                    <p className="text-sm font-bold text-foreground mt-1">Chấm 50+ bài tập cho nhóm Sinh viên Nguy cơ</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* TAB: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-foreground">Danh sách Khóa học giảng dạy</h3>
                <Button size="sm" asChild>
                  <Link href="/teacher/courses/new"><PlusCircle className="h-4 w-4 mr-2" /> Tạo khóa học mới</Link>
                </Button>
              </div>
              
              {stats.courses?.length === 0 ? (
                <GlassCard className="p-8 text-center text-muted-foreground">
                  Chưa có khóa học nào.
                </GlassCard>
              ) : (
                <div className="grid gap-4">
                  {stats.courses.map((course: any) => (
                    <GlassCard key={course.id} className="flex justify-between items-center p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-secondary rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {course.thumbnailUrl ? 'Thumb' : 'No Thumb'}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{course.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center"><Users className="h-3 w-3 mr-1" /> {course._count.enrollments}</span>
                            <span className="flex items-center"><BookOpen className="h-3 w-3 mr-1" /> {course._count.lessons} bài học</span>
                            {course.isPublished ? (
                              <Badge variant="success" className="text-[9px]">Published</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px]">Draft</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/courses/${course.slug}`}><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
                      </Button>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <GlassCard className="p-8 text-center">
                <Star className="h-10 w-10 text-amber-500 mx-auto opacity-50 mb-4" />
                <h3 className="font-bold text-foreground">Hệ thống Đánh giá đang được cập nhật</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Chức năng thu thập phản hồi của học viên dành riêng cho Giảng viên sẽ sớm ra mắt ở phiên bản tới.
                </p>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
