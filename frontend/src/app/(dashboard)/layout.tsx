import { AuthGuard } from '@/components/auth-guard';
import { Sidebar } from '@/components/layout/sidebar';
import { NotificationBell } from '@/components/layout/notification-bell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-mesh">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-end border-b border-border/60 bg-card/50 px-6 backdrop-blur z-50">
            <NotificationBell />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
