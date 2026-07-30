'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, ClipboardCheck, LayoutDashboard, TrendingUp, Users, 
  AlertTriangle, ArrowRight, Calendar as CalendarIcon, Bell, 
  Megaphone, Clock, CheckCircle2, FileText, Sparkles, BarChart3, Loader2, X
} from 'lucide-react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/dashboard/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const groupColors: Record<string, string> = {
  EXCELLENT: 'border-emerald-500/40 bg-emerald-500/5',
  AVERAGE: 'border-amber-500/40 bg-amber-500/5',
  NEEDS_SUPPORT: 'border-rose-500/40 bg-rose-500/5',
};

const groupBadge: Record<string, 'success' | 'warning' | 'destructive'> = {
  EXCELLENT: 'success',
  AVERAGE: 'warning',
  NEEDS_SUPPORT: 'destructive',
};

export function TeacherDashboardView() {
  const [activeTab, setActiveTab] = useState<'management' | 'grading' | 'analytics'>('management');
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEmailResult, setAiEmailResult] = useState('');

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const handleGenerateAI = () => {
    setShowAIModal(true);
    setIsGenerating(true);
    setAiEmailResult('');
    setTimeout(() => {
      setIsGenerating(false);
      setAiEmailResult('Chào các em nhóm nguy cơ,\n\nCô/Thầy nhận thấy tiến độ học tập gần đây của các em đang gặp chút khó khăn (Điểm trung bình dưới 50%). Hệ thống AI của chúng ta đã tổng hợp lại các khái niệm các em thường hay sai.\n\nĐừng lo lắng! Cô đã chuẩn bị một số bài tập bổ trợ ngắn và gợi ý tài liệu học thêm dưới đây để các em ôn tập lại. Nếu cần, hãy đặt lịch hẹn với cô trong tuần này nhé.\n\nCố lên nhé!\n\n(Drafted by AI Assistant)');
    }, 2500);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: analyticsService.getTeacherDashboard,
  });

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-2xl" />;
  }

  if (error || !data) {
    return (
      <GlassCard className="p-8 text-center border-destructive/20 bg-destructive/5">
        <p className="text-sm font-semibold text-destructive">Không thể tải thông tin Bảng điều khiển Giảng viên.</p>
      </GlassCard>
    );
  }

  const needsSupportGroup = data.studentGroups?.find((g) => g.key === 'NEEDS_SUPPORT');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trung tâm Quản lý Giảng viên"
        description="Quản lý toàn diện: Học viên, Lớp học, Chấm bài và Phân tích Dữ liệu"
        icon={LayoutDashboard}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-semibold shadow-sm" onClick={() => setShowAnnouncementModal(true)}>
              <Megaphone className="mr-1.5 h-4 w-4 text-primary" />
              Tạo Thông báo Mới
            </Button>
            {data.summary.pendingGrading > 0 && (
              <Button asChild className="font-bold shadow-md">
                <Link href="/teacher/grading">
                  <ClipboardCheck className="mr-1.5 h-4 w-4" />
                  Chấm {data.summary.pendingGrading} bài chờ
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto hide-scrollbar">
        <Button 
          variant={activeTab === 'management' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('management')}
          className="text-xs font-semibold"
        >
          <Users className="mr-1.5 h-4 w-4" /> Quản lý Lớp & Sinh viên
        </Button>
        <Button 
          variant={activeTab === 'grading' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('grading')}
          className="text-xs font-semibold"
        >
          <ClipboardCheck className="mr-1.5 h-4 w-4" /> Chấm bài & Đánh giá
        </Button>
        <Button 
          variant={activeTab === 'analytics' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setActiveTab('analytics')}
          className="text-xs font-semibold"
        >
          <BarChart3 className="mr-1.5 h-4 w-4" /> Phân tích & Lịch trình
        </Button>
      </div>

      {/* TAB: MANAGEMENT (Class & Students) */}
      {activeTab === 'management' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Metrics Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Tổng số khóa học" value={data.summary.totalCourses} icon={BookOpen} color="indigo" />
            <StatCard title="Học viên đang quản lý" value={data.summary.totalStudents} icon={Users} color="violet" />
            <StatCard title="Điểm TB toàn lớp" value={`${data.summary.classAverageScore}%`} icon={TrendingUp} color="emerald" />
            <StatCard title="Phân luồng hỗ trợ" value={`${needsSupportGroup?.count ?? 0} nguy cơ`} icon={AlertTriangle} color="rose" />
          </div>

          {/* High Priority Alert: Students at Risk (Always visible for UI demo) */}
          <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Cảnh báo Học viên Cần hỗ trợ (Students at Risk)
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      {needsSupportGroup?.count || 3} học viên
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground font-medium mt-0.5">
                    Có {needsSupportGroup?.count || 3} học viên thuộc nhóm nguy cơ (Điểm TB &lt; 50%). Hệ thống AI đề xuất Gửi Email Động viên và Bài tập Bổ trợ.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs border-rose-500/30 text-rose-600 font-semibold hover:bg-rose-500/10 shadow-sm transition-all active:scale-95" onClick={handleGenerateAI}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Dùng AI tạo Email hỗ trợ
                </Button>
              </div>
            </div>
          </div>

          {/* 3 Student Groups Matrix */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground">Tiến độ Học viên (Student Progress Matrix)</h2>
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/teacher/student-groups">Quản lý chuyên sâu Nhóm</Link>
              </Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {data.studentGroups?.map((group) => (
                <div key={group.key} className={`rounded-xl border ${groupColors[group.key]} p-4 space-y-4`}>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{group.label}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{group.description}</p>
                    </div>
                    <Badge variant={groupBadge[group.key]} className="font-bold">
                      {group.count} học viên
                    </Badge>
                  </div>
                  {group.students.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Chưa có học viên nào ở nhóm này</p>
                  ) : (
                    <div className="space-y-2">
                      {group.students.slice(0, 5).map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-2 text-xs">
                          <span className="font-medium text-foreground truncate">{s.name}</span>
                          <span className="font-bold text-primary">{s.averageScore}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB: GRADING & ASSIGNMENTS */}
      {activeTab === 'grading' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Assignments Need Grading */}
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">Chờ chấm bài & Đánh giá</h3>
                </div>
                <Badge variant="warning">{data.summary.pendingGrading} bài</Badge>
              </div>
              
              {data.summary.pendingGrading > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border bg-card flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Bài tập thực hành UI/UX</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Khóa học Frontend · 3 bài nộp mới</p>
                    </div>
                    <Button size="sm" className="h-7 text-xs">Chấm ngay</Button>
                  </div>
                  <div className="p-3 rounded-lg border border-border bg-card flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-foreground">Tiểu luận Cuối kỳ</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Khóa học Architecture · 1 bài nộp mới</p>
                    </div>
                    <Button size="sm" className="h-7 text-xs">Chấm ngay</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">Tất cả bài tập đã được chấm xong!</p>
                </div>
              )}
            </GlassCard>

            {/* Recent Submissions Feed */}
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm text-foreground">Hoạt động Nộp bài gần đây</h3>
                </div>
              </div>
              <div className="relative space-y-0 pl-4 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[2px] before:bg-border/60">
                <div className="relative pb-5 pl-6">
                  <div className="absolute left-[-21px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <p className="text-xs font-bold text-foreground">Nguyễn Văn A vừa nộp Quiz</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Khóa học React (Điểm tự động: 90/100)</p>
                  <p className="text-[9px] text-muted-foreground mt-1">10 phút trước</p>
                </div>
                <div className="relative pb-5 pl-6">
                  <div className="absolute left-[-21px] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-amber-500 ring-2 ring-amber-500/20" />
                  <p className="text-xs font-bold text-foreground">Trần Thị B vừa nộp Bài tự luận</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Yêu cầu chấm điểm thủ công (Cần Review)</p>
                  <p className="text-[9px] text-muted-foreground mt-1">1 giờ trước</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB: ANALYTICS & SCHEDULE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Recommendations & Trends */}
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold text-sm text-foreground">AI Class Insights (Xu hướng lớp học)</h3>
                </div>
                <Badge variant="primary" className="text-[9px]">AI Generated</Badge>
              </div>
              <div className="space-y-3">
                <div className="p-3 border border-indigo-500/30 bg-indigo-500/5 rounded-lg">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Cảnh báo Điểm thấp (Quiz Trend)</p>
                  <p className="text-xs text-foreground">70% học viên đang làm sai Câu hỏi 4 trong Quiz React Hooks. AI đề xuất Giảng viên nên tạo thêm tài liệu hướng dẫn chuyên sâu phần này.</p>
                </div>
                <div className="p-3 border border-border rounded-lg bg-card">
                  <p className="text-xs font-bold text-foreground mb-1">Xu hướng Tương tác</p>
                  <p className="text-xs text-muted-foreground">Thời gian học viên online và làm bài tập nhiều nhất là từ 20:00 - 23:00. Bạn có thể lên lịch Live Q&A vào khung giờ này.</p>
                </div>
              </div>
            </GlassCard>

            {/* Schedule & Calendar Mockup */}
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-sm text-foreground">Lịch trình Giảng dạy (Today's Teaching)</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 items-center p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-lg">
                  <div className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    <p className="text-sm">20:00</p>
                    <p className="text-[10px]">Tối nay</p>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Live Q&A - Khóa học React</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Qua Google Meet · 45 học viên đăng ký</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center p-3 border border-border bg-card rounded-lg opacity-70">
                  <div className="text-center font-bold text-muted-foreground">
                    <p className="text-sm">09:00</p>
                    <p className="text-[10px]">Ngày mai</p>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Phát hành Bài học mới: Redux Toolkit</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tự động Publish theo lịch (Scheduled)</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
      {/* AI Generate Email Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={() => setShowAIModal(false)}>
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">AI Draft: Email Động viên</h3>
            </div>
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                  AI đang phân tích dữ liệu và soạn thảo nội dung...
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {aiEmailResult}
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => handleGenerateAI()}>Thử lại (Re-generate)</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                    <Megaphone className="mr-2 h-4 w-4" /> Gửi tới Nhóm Nguy cơ
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={() => setShowAnnouncementModal(false)}>
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Tạo Thông báo Mới</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Tiêu đề</label>
                <input 
                  type="text" 
                  id="announcement-title"
                  placeholder="Nhập tiêu đề..." 
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Nội dung</label>
                <textarea 
                  id="announcement-message"
                  rows={4} 
                  placeholder="Nhập nội dung thông báo..." 
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowAnnouncementModal(false)}>Hủy</Button>
                <Button onClick={async () => {
                  const title = (document.getElementById('announcement-title') as HTMLInputElement).value;
                  const message = (document.getElementById('announcement-message') as HTMLTextAreaElement).value;
                  if (!title || !message) return toast.error('Vui lòng nhập đủ thông tin');
                  
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('adaptive_access_token')}`
                      },
                      body: JSON.stringify({ title, message, type: 'SYSTEM' })
                    });
                    if (!res.ok) throw new Error('Lỗi');
                    toast.success('Đã phát thông báo thành công!');
                    setShowAnnouncementModal(false);
                  } catch (e) {
                    toast.error('Có lỗi xảy ra');
                  }
                }}>Phát Thông báo</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
