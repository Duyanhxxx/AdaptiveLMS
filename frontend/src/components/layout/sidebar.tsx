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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/recommendations', label: 'AI Insights', icon: Sparkles },
];

const teacherLinks = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/student-groups', label: 'Student Groups', icon: Users },
  { href: '/teacher/courses', label: 'My Courses', icon: BookOpen },
  { href: '/teacher/grading', label: 'Grading', icon: ClipboardCheck },
  { href: '/courses', label: 'Browse', icon: BookOpen },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  TEACHER: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  STUDENT: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
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
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold tracking-tight">Adaptive LMS</p>
          <p className="text-[11px] text-muted-foreground">Personalized learning</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-brand-gradient text-white shadow-md shadow-indigo-500/25'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/60 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <span
              className={cn(
                'mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                roleColors[user?.role ?? 'STUDENT'],
              )}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
