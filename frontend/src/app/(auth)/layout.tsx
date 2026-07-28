import { GraduationCap, Sparkles, TrendingUp, Users } from 'lucide-react';

const features = [
  { icon: Sparkles, text: 'Gợi ý học tập cá nhân hóa bằng AI' },
  { icon: TrendingUp, text: 'Theo dõi tiến độ và điểm số theo thời gian thực' },
  { icon: Users, text: 'Quản lý lớp học cho giáo viên & admin' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Hero panel — hidden on mobile */}
      <div className="relative hidden w-1/2 overflow-hidden bg-auth-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">Adaptive LMS</p>
            <p className="text-sm text-white/70">Học thông minh, tiến bộ nhanh</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Nền tảng học tập
              <br />
              thích ứng với bạn
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/80">
              Hệ thống LMS thông minh giúp học viên học đúng trọng tâm, giáo viên
              theo dõi lớp hiệu quả.
            </p>
          </div>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          © 2026 Adaptive LMS. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-mesh p-6 sm:p-10">
        {children}
      </div>
    </div>
  );
}
