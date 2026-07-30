# 🎓 ADAPTIVE LMS — AI-Powered Personalized Learning Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-6-darkblue?style=for-the-badge&logo=prisma" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/Google_Gemini-1.5-purple?style=for-the-badge&logo=google" alt="Google Gemini" />
</p>

> **Adaptive LMS** là nền tảng quản trị và cá nhân hóa lộ trình học tập ứng dụng **Generative AI (Google Gemini 1.5 Flash)**, giải quyết triệt để vấn đề "cào bằng" (*One-Size-Fits-All*) của các hệ thống LMS truyền thống. Hệ thống tự động phân loại trình độ học viên thành 3 nhóm (`EXCELLENT`, `AVERAGE`, `NEEDS_SUPPORT`), sinh lộ trình học tập thích ứng, hỗ trợ Giảng viên tạo Quiz & chấm bài luận bằng AI trong vài giây, và cung cấp một **Enterprise Admin Control Center** 360 độ.

---

## 🌟 TÍNH NĂNG NỔI BẬT (KEY FEATURES)

### 1. 🎯 Student Workspace — Cá Nhân Hóa & Gamification
- **Adaptive AI Recommendation**: Đề xuất bài học & kế hoạch luyện tập hàng ngày dựa trên điểm số trung bình (`averageScore`), chuỗi ngày học (`learningStreak`) và các chủ đề yếu (`weakTopics`).
- **Gamification System**: Hệ thống Cấp độ (Level), Điểm kinh nghiệm (XP), Chuỗi ngày học Streak (🔥), Danh hiệu & Huy hiệu (Badges).
- **Interactive Quiz Taker**: Trình làm bài trắc nghiệm / tự luận có đếm giờ và hiển thị phản hồi tức thì từ AI.

### 2. 👩‍🏫 Teacher Workspace — Trợ Lý AI Soạn Bài & Chấm Điểm
- **Direct AI Quiz Generator**: Tạo 5 câu hỏi trắc nghiệm tự động chỉ trong 2 giây bằng nút màu tím **"Dùng AI Tạo Quiz"** ngay trên từng bài học.
- **AI Essay Grading Assistant**: Tự động phân tích bài luận tự luận của học sinh, đưa ra điểm số gợi ý và nhận xét chi tiết theo bảng khung tiêu chí Rubric.
- **Student Risk CRM & Analytics**: Theo dõi danh sách học viên có nguy cơ bỏ học (`weakStudents`), xem biểu đồ tỷ lệ hoàn thành khóa học.

### 3. 🛡️ Enterprise Admin Control Center — Vận Hành 360 Độ
- **System Health & Infrastructure Monitor**: Thống kê thời gian thực CPU (18%), Memory (42%), Database Connections, API Latency (38ms) và Storage.
- **Full Operational CRUD**: Quản lý Người dùng (`/admin/users`) với bộ lọc Vai trò, Tìm kiếm, Đổi trạng thái (`isActive`) và Xóa tài khoản; Quản lý Khóa học (`/admin/courses`) với tính năng Xuất bản/Ẩn và Sửa/Xóa.
- **Active Sessions & Security Control**: Xem chi tiết thiết bị (MacBook, iPhone, Windows), IP, Vị trí và **Thu hồi phiên (Revoke Token)** lạ.
- **AI Token Quota & Cost Tracking**: Giám sát lượng Token và chi phí ước tính của OpenAI, Google Gemini, Anthropic Claude.
- **Audit Logs & Activity Summary**: Nhật ký thao tác 30 ngày có hỗ trợ **Search**, **Filter** và **Export CSV**.

---

## 🛠️ ARCHITECTURE & TECH STACK

```
[ Next.js 15 App Router ] <---> [ NestJS REST API Gateway ] <---> [ PostgreSQL + Prisma ORM ]
       |                                   |                                |
       v                                   v                                v
(TanStack Query Cache)          (JWT / Roles Guard)               (Indexed Schemas)
                                           |
                                           v
                             [ Google Gemini 1.5 Engine ]
```

| Layer | Công nghệ sử dụng | Rationale (Lý do lựa chọn) |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 App Router, React 19, Tailwind CSS | Tối ưu SEO với Server Components; TanStack Query cho Client State. |
| **Design System**| Glassmorphic UI, Lucide Icons, Dark/Light Themes | Tạo trải nghiệm thị giác cao cấp (Wow-factor), hiện đại. |
| **Backend** | NestJS, TypeScript, RxJS | Architecture chuẩn Modular (Controller-Service-DTO), dễ mở rộng & bảo trì. |
| **Database** | PostgreSQL + Prisma ORM 6 | Type-safety tuyệt đối từ DB Schema sang Frontend TypeScript code. |
| **Bảo mật** | JWT (Access + Refresh Token), bcrypt, Guard RBAC | Kiểm soát phân quyền hạt nhân 3 vai trò (`STUDENT`, `TEACHER`, `ADMIN`). |
| **AI Integration**| Google Gemini 1.5 Flash via SDK | Latency cực thấp (< 1.5s), Context Window rộng, hỗ trợ Tiếng Việt sắc nét. |
| **Deployment** | Vercel (FE) + Railway / Render (BE & DB) | Tự động hóa CI/CD pipeline, sẵn sàng Production. |

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
AdaptiveLMS/
├── backend/                    # NestJS RESTful API Service
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schemas & Indexing
│   │   └── seed.ts             # Orchestrated Seed Generator
│   └── src/
│       ├── ai/                 # Gemini Generative AI Engine
│       ├── analytics/          # Dashboards & System Metrics
│       ├── auth/               # JWT & Password Hash
│       ├── courses/            # Course Management CRUD
│       ├── lessons/            # Lesson Management CRUD
│       ├── quiz/               # Quiz & Question Engine
│       ├── recommendations/    # Adaptive Learning Algorithm
│       ├── submissions/        # Grading & Essay Assistant
│       └── users/              # User Administration
├── frontend/                   # Next.js 15 Web Application
│   └── src/
│       ├── app/                # App Router Layouts & Pages
│       ├── components/         # GlassCard, PageHeader, UI primitives
│       ├── features/           # Admin, Teacher, Student & Profile modules
│       ├── hooks/              # Custom React Hooks & Auth Context
│       ├── services/           # Typed REST API Client
│       └── types/              # TypeScript Interfaces
├── SUBMISSION_MANIFEST.md      # Hồ sơ nộp bài chính thức
└── README.md                   # Tài liệu hướng dẫn chính
```

---

## ⚡ HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### Yêu cầu tiên quyết:
- **Node.js**: `>= 18.x`
- **PostgreSQL**: `>= 14.x` (hoặc Docker)
- **npm**: `>= 9.x`

### Bước 1: Khởi tạo Database (PostgreSQL)
```bash
# Sử dụng Docker Compose nếu không cài local Postgres:
docker compose up -d
```

### Bước 2: Khởi chạy Backend NestJS
```bash
cd backend
npm install

# Sao chép biến môi trường
cp .env.example .env

# Chạy Migration & Seed Dữ liệu mẫu (Tự động nạp 50+ sinh viên, 5 khóa học, 200+ câu hỏi)
npx prisma db push
npx ts-node prisma/seed.ts

# Chạy Backend dev server (Default: http://localhost:3001)
npm run start:dev
```
- **API Swagger Documentation**: `http://localhost:3001/api/docs`

### Bước 3: Khởi chạy Frontend Next.js
```bash
cd frontend
npm install

# Sao chép biến môi trường
cp .env.example .env.local

# Chạy Frontend dev server (Default: http://localhost:3000)
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🔑 TÀI KHOẢN DÙNG THỬ (SEED CREDENTIALS)

Mọi tài khoản đều sử dụng **Mật khẩu chung**: `password123` (hoặc `Password123!`)

| Vai trò | Email đăng nhập | Quyền hạn nổi bật |
| :--- | :--- | :--- |
| **Admin** | `admin@adaptivelms.com` (hoặc `admin@adaptive.edu.vn`) | System Health, Active Sessions, User CRUD, Course CRUD |
| **Teacher** | `teacher@adaptivelms.com` (hoặc `teacher1@adaptive.edu.vn`) | Tạo khóa học, **AI Quiz Generator**, **AI Essay Assistant** |
| **Student (Xuất sắc)** | `student@adaptivelms.com` | Lộ trình học bài Nâng cao, Gamification |
| **Student (Cần hỗ trợ)**| `nguyen.van.an.1@student.edu.vn` | Nhận lời khuyên AI Động viên, Bài luyện tập nền tảng |

---

## ⚖️ TECHNICAL DECISIONS & TRADE-OFFS

### 1. Tại sao chọn Next.js 15 App Router & NestJS?
- **Next.js 15**: Render giao diện cực nhanh với Server Components và giảm thời gian nạp trang đầu tiên.
- **NestJS**: Đảm bảo dự án không bị biến thành Spaghetticode khi mở rộng. Cung cấp cơ chế Dependency Injection, Pipes và Guards tiêu chuẩn Enterprise.

### 2. Trade-offs (Những đánh đổi đã đưa ra):
- **Gọi AI đồng bộ (Synchronous AI Calls)**: Chấp nhận thời gian phản hồi AI từ 1.5s đến 2s thay vì dựng hạ tầng phức tạp với Redis + BullMQ Queue nhằm đảm bảo tính ổn định cao nhất cho bản MVP.
- **Nhúng Video Embed URL (YouTube)**: Thay vì tự viết Video Streaming Server (HLS/DASH) để tập trung 100% thời gian tối ưu hóa Thuật toán cá nhân hóa và các công cụ AI.
- **Lưu JWT tại LocalStorage**: Triển khai nhanh chóng giữa Frontend Vercel và Backend Railway khác domain, kết hợp với việc kiểm tra sanitization cẩn thận ở API backend.

---

## 📄 LICENSE

Dự án phát triển mã nguồn mở theo giấy phép **MIT License**.
