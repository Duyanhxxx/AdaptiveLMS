'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/layout/glass-card';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Shield,
  UserCheck,
  Lock,
  Key,
  Smartphone,
  Globe,
  Activity,
  FileText,
  Bell,
  Palette,
  Sparkles,
  Server,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Laptop,
  Layers,
  Cpu,
  HardDrive,
  Database,
  Mail,
  Zap,
  LogOut,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import type { User } from '@/types';

interface AdminWorkspaceViewProps {
  profile: User & {
    createdAt?: string;
  };
}

export function AdminWorkspaceView({ profile }: AdminWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'security' | 'sessions' | 'permissions' | 'audit' | 'integrations' | 'preferences'
  >('overview');

  // Search & Filter state for Activity Log
  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  // Toggle states for Notification Preferences
  const [notifications, setNotifications] = useState({
    securityAlert: true,
    aiAlert: true,
    backupAlert: true,
    systemMaintenance: true,
    newUserRegistration: true,
    emailNotification: true,
    pushNotification: false,
  });

  // Appearance Settings State
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [accentColor, setAccentColor] = useState('indigo');

  // Sessions Mock State
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'MacBook Pro 16"',
      browser: 'Chrome 122.0',
      os: 'macOS Sonoma',
      ip: '113.161.42.18',
      location: 'Ho Chi Minh City, Vietnam',
      loginTime: 'Hôm nay, 10:15',
      isCurrent: true,
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      os: 'iOS 17.3',
      ip: '14.241.12.90',
      location: 'Hanoi, Vietnam',
      loginTime: 'Hôm qua, 18:30',
      isCurrent: false,
    },
    {
      id: 'sess-3',
      device: 'Windows Workstation',
      browser: 'Edge 121.0',
      os: 'Windows 11',
      ip: '118.69.182.5',
      location: 'Danang, Vietnam',
      loginTime: '3 ngày trước',
      isCurrent: false,
    },
  ]);

  // Activity Logs Mock Data
  const activityLogs = [
    { id: '1', action: 'User Created', target: 'giangvien.nguyen@lms.com', category: 'USER', time: '10 phút trước', status: 'SUCCESS' },
    { id: '2', action: 'System Settings Changed', target: 'Max Upload Size -> 50MB', category: 'SYSTEM', time: '1 giờ trước', status: 'SUCCESS' },
    { id: '3', action: 'AI Configuration Updated', target: 'Model GPT-4o enabled', category: 'AI', time: '3 giờ trước', status: 'SUCCESS' },
    { id: '4', action: 'Course Deleted', target: 'Khóa học Test 101', category: 'COURSE', time: 'Hôm qua, 14:20', status: 'WARNING' },
    { id: '5', action: 'Export Report', target: 'Audit_Summary_Q2.csv', category: 'REPORT', time: '2 ngày trước', status: 'SUCCESS' },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) || log.target.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logFilter === 'ALL' || log.category === logFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Đã hủy phiên đăng nhập thiết bị thành công');
  };

  const handleRevokeOthers = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('Đã đăng xuất khỏi tất cả các thiết bị khác');
  };

  const handleExportCSV = () => {
    const headers = 'ID,Action,Target,Category,Time,Status\n';
    const rows = filteredLogs.map((l) => `${l.id},"${l.action}","${l.target}",${l.category},${l.time},${l.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Admin_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Đã xuất báo cáo CSV thành công!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Enterprise Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-extrabold text-white shadow-xl ring-4 ring-white/10">
              {profile.firstName[0]}
              {profile.lastName[0]}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-slate-950" title="Online Active" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h1>
                <Badge variant="outline" className="border-indigo-400/40 bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                  {profile.role} WORKSPACE
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-300 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-400" /> {profile.email} • Employee ID: <span className="font-mono text-indigo-300">ADM-88942</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <span className="rounded bg-slate-800/80 px-2 py-0.5 border border-slate-700">Dept: System Operations</span>
                <span className="rounded bg-slate-800/80 px-2 py-0.5 border border-slate-700">Position: Principal Administrator</span>
                <span className="rounded bg-slate-800/80 px-2 py-0.5 border border-slate-700">Timezone: Asia/Ho_Chi_Minh (UTC+7)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" onClick={handleRevokeOthers} className="bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800">
              <LogOut className="h-4 w-4 mr-2 text-rose-400" /> Đăng xuất thiết bị khác
            </Button>
            <Button size="sm" onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              <Download className="h-4 w-4 mr-2" /> Báo cáo Audit CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Sidebar / Tabs */}
      <div className="flex border-b border-border space-x-2 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: '1. Overview & Info', icon: UserCheck },
          { id: 'security', label: '2. Security Control', icon: Lock },
          { id: 'sessions', label: '3. Active Sessions', icon: Laptop },
          { id: 'permissions', label: '4. Permissions Matrix', icon: Key },
          { id: 'audit', label: '5. Activity & Audit Logs', icon: FileText },
          { id: 'integrations', label: '6. API & Integrations', icon: Sparkles },
          { id: 'preferences', label: '7. Preferences & System', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ACCOUNT INFORMATION */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Operational Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Permission Level</p>
                <h4 className="text-lg font-bold text-foreground">SUPER_ADMIN</h4>
                <p className="text-[10px] text-emerald-600 font-medium">Full Unrestricted Access</p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Active Sessions</p>
                <h4 className="text-lg font-bold text-foreground">{sessions.length} Thiết bị</h4>
                <p className="text-[10px] text-muted-foreground">MacBook, iPhone, Edge</p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Security Score</p>
                <h4 className="text-lg font-bold text-foreground">95 / 100</h4>
                <p className="text-[10px] text-amber-600 font-medium">Khuyên dùng: Bật 2FA</p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex items-center gap-4 border-l-4 border-l-violet-500">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">System Version</p>
                <h4 className="text-lg font-bold text-foreground">v2.4.0-Enterprise</h4>
                <p className="text-[10px] text-violet-600 font-medium">Production Node</p>
              </div>
            </GlassCard>
          </div>

          {/* Account Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-500" /> Thông tin Tài khoản Quản trị
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Họ và Tên</p>
                  <p className="font-bold text-foreground mt-0.5">{profile.firstName} {profile.lastName}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Tên đăng nhập (Username)</p>
                  <p className="font-bold text-foreground mt-0.5">admin_master</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Email quản trị</p>
                  <p className="font-bold text-foreground mt-0.5 truncate">{profile.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Mã nhân viên (Employee ID)</p>
                  <p className="font-bold text-indigo-600 mt-0.5">ADM-88942</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Phòng ban (Department)</p>
                  <p className="font-bold text-foreground mt-0.5">System Infrastructure</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Chức vụ (Position)</p>
                  <p className="font-bold text-foreground mt-0.5">Principal System Architect</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" /> Trạng thái & Vùng hoạt động
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Trạng thái Tài khoản</p>
                  <Badge variant="outline" className="mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">ACTIVE</Badge>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Lần đăng nhập cuối</p>
                  <p className="font-bold text-foreground mt-0.5">Hôm nay, 10:15</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Múi giờ (Timezone)</p>
                  <p className="font-bold text-foreground mt-0.5">Asia/Ho_Chi_Minh (UTC+7)</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-muted-foreground">Ngôn ngữ mặc định</p>
                  <p className="font-bold text-foreground mt-0.5">Tiếng Việt (vi-VN)</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY CONTROL */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Password Change Form */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-500" /> Đổi mật khẩu Quản trị
              </h3>
              <p className="text-xs text-muted-foreground">
                Mật khẩu Admin yêu cầu tối thiểu 12 ký tự, bao gồm chữ hoa, chữ số và ký tự đặc biệt.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Đã cập nhật mật khẩu thành công!'); }} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Mật khẩu hiện tại</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mật khẩu mới</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Xác nhận mật khẩu mới</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
                <Button type="submit" className="w-full mt-2">Cập nhật Mật khẩu</Button>
              </form>
            </GlassCard>

            {/* 2FA & Recovery Email */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-emerald-500" /> Xác thực hai yếu tố (2FA) & Khôi phục
              </h3>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xs text-foreground">Authenticator App (TOTP)</p>
                    <p className="text-[11px] text-muted-foreground">Sử dụng Google Authenticator hoặc Authy</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">ĐÃ BẬT</Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2">
                <p className="font-bold text-xs text-foreground">Email Khôi phục sự cố (Recovery Email)</p>
                <Input defaultValue="admin-recovery@adaptivelms.com" className="text-xs" />
                <Button variant="outline" size="sm" className="w-full mt-1 text-xs">Cập nhật Email khôi phục</Button>
              </div>
            </GlassCard>
          </div>

          {/* Login History & Security Events */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> Lịch sử Đăng nhập & Đội tin cậy (Security Audit)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="p-2.5">Thời gian</th>
                    <th className="p-2.5">Thiết bị / Browser</th>
                    <th className="p-2.5">Địa chỉ IP</th>
                    <th className="p-2.5">Vị trí</th>
                    <th className="p-2.5">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2.5 font-semibold">Hôm nay, 10:15</td>
                    <td className="p-2.5">MacBook Pro / Chrome</td>
                    <td className="p-2.5 font-mono">113.161.42.18</td>
                    <td className="p-2.5">Ho Chi Minh City</td>
                    <td className="p-2.5"><Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Thành công</Badge></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Hôm nay, 08:30</td>
                    <td className="p-2.5">Unknown Device</td>
                    <td className="p-2.5 font-mono">198.51.100.42</td>
                    <td className="p-2.5">Unknown Location</td>
                    <td className="p-2.5"><Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px]">Thất bại (Sai Pass)</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-indigo-500" /> Quản lý Phiên Đăng nhập (Active Sessions)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Danh sách tất cả các thiết bị đang duy trì token truy cập tài khoản Admin.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleRevokeOthers}>
                <LogOut className="h-4 w-4 mr-2" /> Đăng xuất tất cả thiết bị khác
              </Button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-secondary/20 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-foreground">{sess.device}</p>
                        {sess.isCurrent && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                            THIẾT BỊ HIỆN TẠI
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sess.browser} • {sess.os} • IP: <span className="font-mono text-foreground">{sess.ip}</span> ({sess.location})
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button variant="outline" size="sm" onClick={() => handleRevokeSession(sess.id)} className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10">
                      Thu hồi phiên (Revoke)
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <GlassCard className="p-6">
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" /> Ma trận Quyền hạn Hiện tại (Read-Only Permissions)
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Quyền hạn của tài khoản Admin được cấu hình bởi Hệ thống và không thể thay đổi từ phía người dùng.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {[
                { name: 'User Management', desc: 'Tạo, sửa, xóa, khóa tài khoản', allowed: true },
                { name: 'Teacher Management', desc: 'Phê duyệt hồ sơ giảng viên', allowed: true },
                { name: 'Student Management', desc: 'Quản lý thông tin học viên', allowed: true },
                { name: 'Course Management', desc: 'Duyệt xuất bản và xóa khóa học', allowed: true },
                { name: 'AI Management', desc: 'Cấu hình Prompt và Model AI', allowed: true },
                { name: 'System Configuration', desc: 'Thay đổi tham số hạ tầng', allowed: true },
                { name: 'Analytics & Reports', desc: 'Xem báo cáo doanh thu & tỷ lệ', allowed: true },
                { name: 'Database Backup', desc: 'Thực hiện sao lưu dữ liệu', allowed: true },
                { name: 'System Restore', desc: 'Khôi phục hệ thống từ Backup', allowed: true },
              ].map((p, i) => (
                <div key={i} className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-foreground">{p.name}</p>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS & SUMMARY */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 30-Day Audit Summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-4">
            <GlassCard className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">Tổng Thao tác (30 ngày)</p>
              <h4 className="text-2xl font-bold text-foreground mt-1">1,420</h4>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">Tài khoản Đã tạo</p>
              <h4 className="text-2xl font-bold text-emerald-600 mt-1">+184</h4>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">Khóa học Đã duyệt</p>
              <h4 className="text-2xl font-bold text-indigo-600 mt-1">24</h4>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">Đăng nhập Thất bại</p>
              <h4 className="text-2xl font-bold text-rose-500 mt-1">3 lần</h4>
            </GlassCard>
          </div>

          {/* Activity Logs Table */}
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Timeline Nhật ký Thao tác (Activity Log)
              </h3>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm thao tác..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="pl-8 text-xs h-9"
                  />
                </div>
                <Button size="sm" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1.5" /> Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="p-2.5">Thời gian</th>
                    <th className="p-2.5">Hành động (Action)</th>
                    <th className="p-2.5">Đối tượng (Target)</th>
                    <th className="p-2.5">Phân loại</th>
                    <th className="p-2.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/20">
                      <td className="p-2.5 font-medium text-muted-foreground">{log.time}</td>
                      <td className="p-2.5 font-bold text-foreground">{log.action}</td>
                      <td className="p-2.5 text-muted-foreground">{log.target}</td>
                      <td className="p-2.5"><Badge variant="outline" className="text-[9px]">{log.category}</Badge></td>
                      <td className="p-2.5 text-right">
                        <Badge variant="outline" className={`text-[9px] ${log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 6: INTEGRATIONS & API KEYS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* AI Providers Keys */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" /> Tích hợp Dịch vụ Generative AI (AI API Keys)
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: 'OpenAI (GPT-4o)', status: 'CONNECTED', quota: '85,000 / 100,000 Tokens', cost: '$12.40' },
                { name: 'Google Gemini Pro', status: 'CONNECTED', quota: 'Unlimited (API Key Active)', cost: '$0.00' },
                { name: 'Anthropic Claude 3', status: 'STANDBY', quota: '0 / 50,000 Tokens', cost: '$0.00' },
              ].map((ai, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-foreground">{ai.name}</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{ai.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Quota: {ai.quota}</p>
                  <p className="text-xs font-semibold text-violet-600">Ước tính chi phí: {ai.cost}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* External Services */}
          <GlassCard className="p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-500" /> Dịch vụ Hạ tầng Bên thứ ba (External Services)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3.5 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-foreground">SMTP Mailer (SendGrid)</p>
                  <p className="text-[11px] text-muted-foreground">Gửi email thông báo & Reset Password</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">OPERATIONAL</Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-foreground">Google OAuth 2.0</p>
                  <p className="text-[11px] text-muted-foreground">Xác thực đăng nhập nhanh cho Học viên</p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">ACTIVE</Badge>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 7: PREFERENCES & SYSTEM INFO */}
      {activeTab === 'preferences' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Notification Preferences */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" /> Cấu hình Cảnh báo & Thông báo
              </h3>
              <div className="space-y-3 text-xs">
                {Object.entries(notifications).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Button
                      variant={val ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() => setNotifications((prev) => ({ ...prev, [key]: !val }))}
                    >
                      {val ? 'Bật' : 'Tắt'}
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Appearance Preferences */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Palette className="h-5 w-5 text-indigo-500" /> Tùy chỉnh Giao diện Workspace
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Theme Môi trường</Label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value as any)} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs">
                    <option value="dark">Dark Mode (Khuyên dùng cho Admin)</option>
                    <option value="light">Light Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Mật độ Hiển thị (Layout Density)</Label>
                  <select value={density} onChange={(e) => setDensity(e.target.value as any)} className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs">
                    <option value="comfortable">Comfortable (Tiêu chuẩn)</option>
                    <option value="compact">Compact (Mật độ cao)</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
