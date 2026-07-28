# Adaptive LMS

An AI-powered Learning Management System that creates personalized learning paths for every student.

---

## Features

- **Adaptive Learning** — AI recommends lessons based on performance, weak topics, and learning history
- **Role-based Access** — Admin, Teacher, and Student dashboards
- **Quiz & Assessment** — Auto-grading for MCQ/True-False, manual essay grading
- **Analytics** — Progress tracking, weekly performance charts, weak/strong topic analysis
- **AI Recommendations** — Gemini-powered personalized study plans with Vietnamese feedback

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind v4, React Query, Zod |
| Backend | NestJS, TypeScript, class-validator, Swagger |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | JWT + bcrypt + refresh tokens |
| AI | Google Gemini API |
| Deploy | Vercel (FE) + Render (BE) + Neon (DB) |

---

## Project Structure

```
AdaptiveLMS/
├── backend/                    # NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Seed orchestrator
│   │   ├── seed-data.ts        # Static seed data
│   │   └── seed-helpers.ts     # Seed functions
│   └── src/
│       ├── auth/               # JWT authentication
│       ├── users/              # User management
│       ├── courses/            # Course CRUD
│       ├── lessons/            # Lesson CRUD
│       ├── quiz/               # Quiz & questions
│       ├── submissions/        # Quiz submissions & grading
│       ├── analytics/          # Dashboards & progress
│       ├── recommendations/    # AI learning paths
│       ├── ai/                 # Gemini integration
│       ├── common/             # Shared DTOs, guards, utils
│       └── prisma/             # Database service
├── frontend/                   # Next.js 16 App Router
│   └── src/
│       ├── app/                # Routes (auth, dashboards, courses)
│       ├── components/         # UI, layout, charts
│       ├── features/           # Feature modules
│       ├── services/           # API client
│       ├── hooks/              # Auth context
│       └── types/              # TypeScript interfaces
├── docs/
│   ├── API.md                  # API reference
│   └── DEPLOYMENT.md           # Deployment guide
├── docker-compose.yml          # Local PostgreSQL
└── README.md
```

---

## Architecture

```mermaid
graph TB
    subgraph Client
        FE[Next.js Frontend<br/>Vercel]
    end

    subgraph Backend
        API[NestJS API<br/>Render]
        AUTH[Auth Module]
        AI[AI Module]
        REC[Recommendations]
        ANA[Analytics]
    end

    subgraph Data
        PG[(PostgreSQL<br/>Neon)]
    end

    FE -->|REST + JWT| API
    API --> AUTH
    API --> AI
    API --> REC
    API --> ANA
    API --> PG
    AI -->|Gemini API| GEMINI[Google Gemini]
```

---

## ER Diagram

```mermaid
erDiagram
    User ||--o| StudentProfile : has
    User ||--o{ RefreshToken : has
    User ||--o{ Course : teaches
    User ||--o{ Enrollment : enrolls
    User ||--o{ Submission : submits
    User ||--o{ Recommendation : receives
    User ||--o{ LearningHistory : tracks
    User ||--o{ Notification : receives

    Course ||--o{ Lesson : contains
    Course ||--o{ Enrollment : has

    Lesson ||--o{ Quiz : has
    Lesson ||--o{ LearningHistory : tracks

    Quiz ||--o{ Question : contains
    Quiz ||--o{ Submission : receives

    Submission ||--o{ Answer : contains
    Question ||--o{ Answer : has

    User {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role
        boolean is_active
    }

    StudentProfile {
        uuid id PK
        uuid user_id FK
        enum learning_level
        float average_score
        int learning_streak
        string[] weak_topics
        string[] strong_topics
    }

    Course {
        uuid id PK
        string title
        string slug UK
        enum difficulty
        uuid teacher_id FK
        boolean is_published
    }

    Lesson {
        uuid id PK
        uuid course_id FK
        string title
        text content
        int order
        string[] topics
    }

    Quiz {
        uuid id PK
        uuid lesson_id FK
        string title
        float passing_score
    }

    Question {
        uuid id PK
        uuid quiz_id FK
        string text
        enum type
        json options
        string correct_answer
        string topic
    }

    Submission {
        uuid id PK
        uuid student_id FK
        uuid quiz_id FK
        float score
        enum status
    }

    Recommendation {
        uuid id PK
        uuid student_id FK
        enum learning_level
        string[] strengths
        string[] weaknesses
        json practice_plan
        text explanation
    }
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### 1. Start Database

```bash
docker compose up -d
```

> PostgreSQL runs on port **5433** (avoids conflict with local Postgres on 5432).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- App: `http://localhost:3000`

---

## Seed Data

Running `npx prisma db seed` creates:

| Entity | Count |
|--------|-------|
| Admin | 1 |
| Teachers | 5 |
| Students | 50 (Vietnamese names) |
| Courses | 5 |
| Lessons | 40 |
| Quizzes | 20 |
| Questions | 200 |
| Submissions | 500 |
| Recommendations | 100 |

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@adaptive.edu.vn` | `Password123!` |
| Teacher | `teacher1@adaptive.edu.vn` | `Password123!` |
| Student | `nguyen.van.an.1@student.edu.vn` | `Password123!` |

Students include excellent performers (85–100%), weak students (20–49%), and average students (50–84%).

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://adaptive:adaptive_secret@localhost:5433/adaptive_lms?schema=public
PORT=3001
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Production Build

```bash
# Backend
cd backend && npm ci && npx prisma generate && npm run build

# Frontend
cd frontend && npm ci && npm run build
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, Render, and Neon setup.

See [docs/API.md](docs/API.md) for full API reference.

---

## License

MIT
