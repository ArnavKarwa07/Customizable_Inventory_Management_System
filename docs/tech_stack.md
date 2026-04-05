# Technology Stack — StockPilot IMS v2.0

## Frontend

| Category       | Technology            | Version   | Purpose                                      |
|----------------|-----------------------|-----------|----------------------------------------------|
| Framework      | Next.js               | 14.x      | React meta-framework with App Router         |
| Language       | TypeScript            | 5.x       | Type safety across all components             |
| Styling        | Tailwind CSS          | 3.x       | Utility-first CSS with custom design tokens   |
| HTTP Client    | Axios                 | 1.x       | API calls with auth interceptors              |
| Typography     | Google Fonts          | —         | Manrope (body) + IBM Plex Mono (code)         |
| Routing        | Next.js App Router    | —         | File-based routing with middleware protection  |
| State          | React useState/Effect | —         | Local component state (no global store)       |
| Auth           | JWT + localStorage    | —         | Token persistence + cookie sync for SSR       |

### Frontend Design Decisions

- **No component library** — Custom CSS with design tokens for full control
- **No global state manager** — Each page manages its own data lifecycle
- **Client-side scope checking** — `hasScope()` mirrors backend RBAC for UI gating
- **Cookie + localStorage dual storage** — Cookies for middleware (SSR), localStorage for client

---

## Backend

| Category       | Technology            | Version   | Purpose                                      |
|----------------|-----------------------|-----------|----------------------------------------------|
| Framework      | FastAPI               | 0.100+    | Async Python web framework with OpenAPI       |
| Language       | Python                | 3.11+     | Modern type hints and union syntax            |
| ORM            | SQLAlchemy            | 2.0       | Mapped columns with type annotations          |
| Database       | SQLite                | 3.x       | Zero-config embedded database                 |
| Validation     | Pydantic              | 2.x       | Request/response schema validation            |
| Auth           | PyJWT                 | 2.x       | JWT encode/decode for access + refresh tokens  |
| Hashing        | bcrypt                | 4.x       | Password hashing (direct, no passlib)          |
| Config         | pydantic-settings     | 2.x       | `.env` file configuration management           |
| Server         | Uvicorn               | 0.25+     | ASGI server with hot reload                    |

### Backend Design Decisions

- **Direct bcrypt** — Bypasses passlib to avoid bcrypt>=4.1 compatibility issues
- **No Alembic** — Schema created via `Base.metadata.create_all()` on startup (dev-friendly)
- **Scope-based RBAC** — Permission map in `deps.py` instead of database-stored permissions
- **Audit service** — Centralized `log_action()` called from every write endpoint
- **JWT org_id** — Organization ID embedded in token payload for fast scoping

---

## Database

| Feature              | Implementation                                    |
|----------------------|---------------------------------------------------|
| Engine               | SQLite (file-based)                               |
| ORM                  | SQLAlchemy 2.0 Mapped columns                     |
| Multi-tenancy        | `org_id` FK on all tenant-scoped tables            |
| Session management   | Scoped sessions with `SessionLocal()`              |
| Schema creation      | Auto-DDL via `create_all()` in lifespan handler    |
| PostgreSQL path      | Change `DATABASE_URL` + install `psycopg2`         |

---

## Security Stack

| Feature              | Implementation                                    |
|----------------------|---------------------------------------------------|
| Authentication       | JWT (access 24h + refresh 7d, rotation)            |
| Password hashing     | bcrypt with 72-byte truncation                     |
| Authorization        | Scope-based RBAC (4 tiers, 30+ scopes)             |
| Data isolation       | Org-scoped queries on every endpoint                |
| CORS                 | Configurable origin whitelist                       |
| Input validation     | Pydantic v2 schemas on all endpoints                |
| Audit trail          | Every write action logged to `audit_logs` table     |

---

## Development Tools

| Tool                 | Purpose                                           |
|----------------------|---------------------------------------------------|
| Swagger UI           | Interactive API docs at `/docs`                    |
| ReDoc                | Alternative API docs at `/redoc`                   |
| npm run dev          | Frontend dev server with hot reload                |
| uvicorn --reload     | Backend dev server with auto-reload                |
| Docker Compose       | Optional containerized development                 |

---

## Environment Variables

### Backend (`.env`)

```ini
DATABASE_URL=sqlite:///./inventory.db
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
```

### Frontend (`.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
