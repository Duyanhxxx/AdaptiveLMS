# Deployment Guide

This guide covers deploying Adaptive LMS to production using **Vercel** (frontend), **Render** (backend), and **Neon** (PostgreSQL).

---

## Architecture

```
┌─────────────┐     HTTPS      ┌─────────────┐     REST/JWT    ┌─────────────┐
│   Vercel    │ ──────────────▶│   Render    │ ──────────────▶│    Neon     │
│  (Next.js)  │                │  (NestJS)   │                │ (PostgreSQL)│
└─────────────┘                └─────────────┘                └─────────────┘
                                      │
                                      ▼
                               ┌─────────────┐
                               │ Gemini API  │
                               └─────────────┘
```

---

## 1. Neon PostgreSQL Setup

### Create database

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project: `adaptive-lms`
3. Copy the **connection string** (pooled recommended for serverless):

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/adaptive_lms?sslmode=require
```

### Run migrations

```bash
cd backend
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
DATABASE_URL="your-neon-connection-string" npx prisma db seed
```

---

## 2. Render Backend Deployment

### Option A: Docker (recommended)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repository
4. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Environment | `Docker` |
| Dockerfile | `Dockerfile` |
| Port | `3001` |

### Option B: Node.js

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && npm run start:prod` |

### Environment Variables (Render)

```env
DATABASE_URL=postgresql://...@neon.tech/adaptive_lms?sslmode=require
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
GEMINI_API_KEY=your-gemini-api-key
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Health check

Set health check path to: `/api/v1/health`

---

## 3. Vercel Frontend Deployment

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |

### Environment Variables (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

4. Deploy

### Update backend CORS

After deploying frontend, update `FRONTEND_URL` on Render to your Vercel URL.

---

## 4. Local Docker Development

```bash
# Start PostgreSQL
docker compose up -d

# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## 5. Production Build Commands

### Backend

```bash
cd backend
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm run start:prod
```

### Frontend

```bash
cd frontend
npm ci
npm run build
npm run start
```

### Docker (full stack with DB)

```bash
docker compose up -d          # PostgreSQL only
docker build -t adaptive-lms-api ./backend
docker run -p 3001:3001 --env-file backend/.env adaptive-lms-api
```

---

## 6. Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Seed data loaded (optional for production)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong random strings
- [ ] `FRONTEND_URL` matches Vercel domain
- [ ] `NEXT_PUBLIC_API_URL` matches Render domain
- [ ] CORS allows frontend origin
- [ ] Health check returns `database: connected`
- [ ] Swagger docs accessible at `/api/docs`
- [ ] Gemini API key configured (or fallback mode active)

---

## 7. Default Seed Credentials

After running `npx prisma db seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@adaptive.edu.vn` | `Password123!` |
| Teacher | `teacher1@adaptive.edu.vn` | `Password123!` |
| Student | `nguyen.van.an.1@student.edu.vn` | `Password123!` |

> Change all passwords before going to production.
