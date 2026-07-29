'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  Megaphone,
  UserCircle,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/recommendations', label: 'Gợi ý AI', icon: Sparkles },
  { href: '/calendar', label: 'Lịch học cá nhân', icon: Calendar },
  { href: '/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

const teacherLinks = [
  { href: '/teacher/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/teacher/student-groups', label: 'Nhóm học sinh', icon: Users },
  { href: '/teacher/courses', label: 'Khóa học của tôi', icon: BookOpen },
  { href: '/teacher/grading', label: 'Chấm bài', icon: ClipboardCheck },
  { href: '/courses', label: 'Tất cả khóa học', icon: BookOpen },
  { href: '/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Tổng quan Hệ thống', icon: LayoutDashboard },
  { href: '/courses', label: 'Quản lý Khóa học', icon: BookOpen },
  { href: '/admin/users', label: 'Quản lý Người dùng', icon: Users },
  { href: '/admin/broadcast', label: 'Thông báo Broadcast', icon: Megaphone },
  { href: '/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  TEACHER: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
  STUDENT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const links =
    user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'TEACHER'
        ? teacherLinks
        : studentLinks;

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '?';

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/95 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold tracking-tight text-foreground text-sm">Adaptive LMS</p>
          <p className="text-[11px] text-muted-foreground font-medium">AI Personalized Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
              )}
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <span
              className={cn(
                'mt-0.5 inline-block rounded px-1.5 py-0.2 text-[10px] font-bold tracking-wider uppercase',
                roleColors[user?.role ?? 'STUDENT'],
              )}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
