'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsService } from '@/services/analytics.service';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import {
  Shield,
  Activity,
  Users,
  BookOpen,
  DollarSign,
  Cpu,
  HardDrive,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  GraduationCap,
  Server,
  Key,
  FileText,
  CheckCircle2,
  Lock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import type { AdminDashboard } from '@/types';

export function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'logs'>('overview');

  const { data, isLoading, error } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: analyticsService.getAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Operational Dashboard"
          description="Đang tải dữ liệu vận hành hệ thống..."
          icon={Shield}
        />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-destructive">
        Không thể tải dữ liệu Admin Dashboard. Vui lòng kiểm tra lại kết nối.
      </div>
    );
  }

  const {
    summary,
    systemHealth,
    aiUsage,
    qualityMetrics,
    topStudents,
    weakStudents,
    topCourses,
    topTeachers,
    systemLogs,
  } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Vận hành Hệ thống (Admin Operational Control)"
          description="Giám sát hiệu năng hạ tầng, doanh thu, phân quyền người dùng và chỉ số AI"
          icon={Shield}
        />
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System: {systemHealth?.status ?? 'OPERATIONAL'}
          </Badge>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            Uptime: {systemHealth?.uptime ?? '99.98%'}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Activity className="h-4 w-4" /> Tổng quan Vận hành & Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4" /> Phân quyền & Vai trò (Roles & Permissions)
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Nhật ký Hệ thống (System Audit Logs)
        </button>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doanh thu Ước tính</p>
                <h4 className="text-2xl font-extrabold text-foreground mt-0.5">${summary.estimatedRevenue?.toLocaleString() ?? 0}</h4>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +${summary.monthlyRevenue?.toLocaleString()}/tháng này
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-indigo-500">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng Người dùng</p>
                <h4 className="text-2xl font-extrabold text-foreground mt-0.5">{summary.totalUsers ?? summary.totalStudents}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {summary.totalStudents} Sinh viên • {summary.totalTeachers ?? 0} Giảng viên
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-violet-500">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sử dụng Generative AI</p>
                <h4 className="text-2xl font-extrabold text-foreground mt-0.5">{aiUsage?.totalRequests ?? 0} Yêu cầu</h4>
                <p className="text-[11px] text-violet-600 font-medium mt-0.5">
                  ~{(aiUsage?.totalTokens ?? 0).toLocaleString()} tokens (~${aiUsage?.estimatedCostUsd ?? 0})
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Users (24h)</p>
                <h4 className="text-2xl font-extrabold text-foreground mt-0.5">{systemHealth?.activeUsers24h ?? 0}</h4>
                <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                  API Latency: {systemHealth?.apiLatencyMs ?? 38}ms
                </p>
              </div>
            </GlassCard>
          </div>

          {/* System Infrastructure & AI Usage Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* System Health Breakdown */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-indigo-500" /> Sức khỏe Hạ tầng (System Health)
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-indigo-500" /> CPU Load</span>
                    <span className="text-foreground">{systemHealth?.cpuUsage ?? '18%'}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: systemHealth?.cpuUsage ?? '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-violet-500" /> Memory Usage (RAM)</span>
                    <span className="text-foreground">{systemHealth?.memoryUsage ?? '42%'}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full" style={{ width: systemHealth?.memoryUsage ?? '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-emerald-500" /> Cloud Storage</span>
                    <span className="text-foreground">{systemHealth?.storageUsedGb ?? 14.2} / {systemHealth?.storageMaxGb ?? 100} GB</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((systemHealth?.storageUsedGb ?? 14.2) / (systemHealth?.storageMaxGb ?? 100)) * 100}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Database Connections:</span>
                  <span className="font-bold text-foreground">{systemHealth?.dbConnections ?? 12} active pool</span>
                </div>
              </div>
            </GlassCard>

            {/* Quality & Dropout Metrics */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Chất lượng & Tỷ lệ Bỏ học (Quality & Dropout)
              </h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-muted-foreground">Tỷ lệ Hoàn thành Khóa học (Completion Rate)</p>
                  <p className="text-2xl font-bold text-emerald-600">{qualityMetrics?.completionRate ?? 68.5}%</p>
                </div>
                
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-muted-foreground">Tỷ lệ Nguy cơ Bỏ học (Dropout Risk Rate)</p>
                  <p className="text-2xl font-bold text-rose-500">{qualityMetrics?.dropoutRate ?? 8.2}%</p>
                </div>

                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-muted-foreground">Điểm Kiểm tra Trung bình Toàn Sàn</p>
                  <p className="text-2xl font-bold text-indigo-600">{summary.classAverageScore} / 100 đ</p>
                </div>
              </div>
            </GlassCard>

            {/* Top Courses */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-amber-500" /> Top Khóa học Nổi bật (Top Courses)
              </h3>
              <div className="space-y-3">
                {topCourses && topCourses.length > 0 ? (
                  topCourses.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 font-bold text-xs">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-foreground truncate">{c.title}</p>
                          <p className="text-[10px] text-muted-foreground">{c.teacherName}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-primary/10 text-primary border-primary/20">
                        {c.studentsCount} học viên
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Chưa có khóa học nào.</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Rankings: Top Teachers, Top Students, Weak Students */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Top Teachers */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-indigo-500" /> Giảng viên Xuất sắc (Top Teachers)
              </h3>
              <div className="space-y-3">
                {topTeachers && topTeachers.length > 0 ? (
                  topTeachers.map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.coursesCount} khóa học</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-indigo-600">{t.totalStudents} HV</p>
                        <p className="text-[10px] text-muted-foreground">⭐ {t.rating}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Chưa có giảng viên nào.</p>
                )}
              </div>
            </GlassCard>

            {/* Top Students */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <GraduationCap className="h-5 w-5 text-emerald-500" /> Học viên Xuất sắc (Top Students)
              </h3>
              <div className="space-y-3">
                {topStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                      {s.averageScore}đ
                    </Badge>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Weak Students / Risk */}
            <GlassCard className="p-6">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-rose-500" /> Học viên Cần Hỗ trợ (At Risk)
              </h3>
              <div className="space-y-3">
                {weakStudents.length > 0 ? (
                  weakStudents.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-xs">
                          !
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold">
                        {s.averageScore}đ
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Tuyệt vời, tất cả học viên đều đạt chuẩn!</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-500" /> Phân quyền Ma trận (Role Matrix & Permissions)
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Quản lý quyền hạn truy cập API và tính năng cho từng đối tượng trong hệ thống.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground bg-secondary/30">
                  <tr>
                    <th className="p-3 font-semibold">Tính năng / Quyền hạn</th>
                    <th className="p-3 font-semibold text-center">STUDENT</th>
                    <th className="p-3 font-semibold text-center">TEACHER</th>
                    <th className="p-3 font-semibold text-center">ADMIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  <tr>
                    <td className="p-3 font-medium">Học khóa học & Xem video bài học</td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Tạo khóa học, tải bài học & bài tập</td>
                    <td className="p-3 text-center"><span className="text-muted-foreground">—</span></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Sử dụng Trợ giảng AI (Sinh Quiz, Rubric, Assignment)</td>
                    <td className="p-3 text-center"><span className="text-muted-foreground">—</span></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Gửi thông báo Broadcast đến sinh viên</td>
                    <td className="p-3 text-center"><span className="text-muted-foreground">—</span></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Quản lý người dùng, xem Hạ tầng & System Health</td>
                    <td className="p-3 text-center"><span className="text-muted-foreground">—</span></td>
                    <td className="p-3 text-center"><span className="text-muted-foreground">—</span></td>
                    <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: System Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" /> Nhật ký Hoạt động Hệ thống (Audit Logs)
            </h3>
            <div className="space-y-3">
              {systemLogs && systemLogs.length > 0 ? (
                systemLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20 text-xs">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                        {log.role}
                      </Badge>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{log.event}</p>
                        <p className="text-muted-foreground text-[11px]">Thực hiện bởi: {log.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                        {log.status}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Chưa có nhật ký ghi nhận.</p>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
