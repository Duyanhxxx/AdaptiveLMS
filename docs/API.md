# API Documentation

Base URL: `http://localhost:3001/api/v1`  
Interactive docs: `http://localhost:3001/api/docs` (Swagger)

All responses follow this envelope:

```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-07-27T08:00:00.000Z"
}
```

Authenticated endpoints require: `Authorization: Bearer <access_token>`

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Invalidate refresh token |
| GET | `/auth/me` | Bearer | Get current user profile |

---

## Users

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/users` | Admin, Teacher | List users (paginated) |
| GET | `/users/students` | Admin, Teacher | List students |
| GET | `/users/:id` | All | Get user by ID |
| PATCH | `/users/:id` | Self, Admin | Update profile |

**Query params:** `page`, `limit`, `search`, `sortBy`, `sortOrder`, `role`

---

## Courses

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/courses` | All | List courses |
| GET | `/courses/:id` | All | Get course with lessons |
| POST | `/courses` | Teacher, Admin | Create course |
| PATCH | `/courses/:id` | Owner, Admin | Update course |
| DELETE | `/courses/:id` | Owner, Admin | Delete course |

**Query params:** `page`, `limit`, `search`, `difficulty`, `isPublished`, `teacherId`

---

## Lessons

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/lessons` | All | List lessons |
| GET | `/lessons/:id` | All | Get lesson detail |
| POST | `/lessons` | Teacher, Admin | Create lesson |
| PATCH | `/lessons/:id` | Owner, Admin | Update lesson |
| DELETE | `/lessons/:id` | Owner, Admin | Delete lesson |

**Query params:** `courseId`, `difficulty`, `isPublished`

---

## Quiz & Questions

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/quizzes` | All | List quizzes |
| GET | `/quizzes/:id` | All | Get quiz with questions |
| POST | `/quizzes` | Teacher, Admin | Create quiz |
| PATCH | `/quizzes/:id` | Owner, Admin | Update quiz |
| DELETE | `/quizzes/:id` | Owner, Admin | Delete quiz |
| POST | `/quizzes/:quizId/questions` | Teacher, Admin | Add question |
| PATCH | `/questions/:id` | Teacher, Admin | Update question |
| DELETE | `/questions/:id` | Teacher, Admin | Delete question |

---

## Submissions

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/submissions` | Student | Start quiz submission |
| POST | `/submissions/:id/submit` | Student | Submit answers |
| POST | `/submissions/grade-essay` | Teacher, Admin | Grade essay answer |
| GET | `/submissions` | All | List submissions |
| GET | `/submissions/:id` | All | Get submission detail |

---

## Analytics

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/analytics/student/dashboard` | Student | Student dashboard |
| GET | `/analytics/student/:id/dashboard` | Teacher, Admin | View student dashboard |
| GET | `/analytics/student/progress` | Student | Learning progress |
| GET | `/analytics/teacher/dashboard` | Teacher, Admin | Teacher dashboard |

---

## Recommendations

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/recommendations/generate` | Student | Generate AI recommendation |
| GET | `/recommendations/latest` | Student | Latest recommendation |
| GET | `/recommendations` | Student | Recommendation history |

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Health check |

---

## Pagination

All list endpoints support:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page (max 100) |
| `search` | — | Full-text search |
| `sortBy` | varies | Sort field |
| `sortOrder` | `desc` | `asc` or `desc` |

Response includes `meta`:

```json
{
  "data": [],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
