# Customizable Inventory Management System

A comprehensive, modern, and professional inventory management solution built with **Next.js** (frontend), **FastAPI** (backend), and **SQLite** (database). Designed for retail businesses, warehouses, e-commerce platforms, and manufacturing facilities with a focus on beautiful UI/UX and scalability.

## 🌟 Features

### Core Functionality

- ✅ **User Authentication & Authorization** - Secure JWT-based auth with role-based access control
- ✅ **Product Management** - Complete product catalog with SKUs, barcodes, and custom attributes
- ✅ **Multi-Warehouse Inventory Tracking** - Real-time stock levels across multiple warehouses
- ✅ **Stock Movements** - Complete audit trail of all inventory transactions
- ✅ **Order Management** - Purchase and sales order workflows with status tracking
- ✅ **Supplier Management** - Supplier directory and order history
- ✅ **Dashboard & Analytics** - KPI tracking, charts, and custom reports
- ✅ **Audit Logging** - Complete action audit trail for compliance
- ✅ **Export Functionality** - CSV/PDF exports for reports and data

### UI/UX Excellence

- 🎨 Beautiful, professional design system with Tailwind CSS
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌓 Dark/Light theme support
- ♿ WCAG 2.1 Level AA accessibility compliance
- ⚡ Fast performance with optimized components

### Developer Experience

- 🔒 Type-safe: TypeScript + Python type hints
- 📚 Auto-generated API documentation (Swagger)
- 🧪 Comprehensive testing (Jest, Pytest, Playwright)
- 🚀 Async/await support throughout
- 📦 Docker support for local development

---

## 🏗️ Architecture

```
Frontend (Next.js 14) → REST API (FastAPI) → Database (SQLite)
    │                        │                      │
    ├─ React Components       ├─ Service Layer      ├─ User Management
    ├─ State Management       ├─ Business Logic     ├─ Products
    ├─ API Client             ├─ Validation         ├─ Inventory
    └─ Authentication         └─ Authorization      ├─ Orders
                                                    └─ Suppliers
```

**Detailed documentation**: See [architecture.md](./architecture.md)

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn/UI components
- **State**: Zustand (client state) + React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **HTTP**: Axios with interceptors
- **Testing**: Jest, React Testing Library, Playwright

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 with async support
- **Database**: SQLite (with PostgreSQL migration path)
- **Auth**: JWT tokens with refresh rotation
- **Validation**: Pydantic v2
- **ASGI Server**: Uvicorn
- **Testing**: Pytest with coverage tracking

**Full tech stack details**: See [tech_stack.md](./tech_stack.md)

---

## 📋 Project Documentation

- **[SRS.md](./SRS.md)** - Software Requirements Specification
- **[tech_stack.md](./tech_stack.md)** - Technology stack rationale and dependencies
- **[architecture.md](./architecture.md)** - System architecture and design patterns
- **[system_design.md](./system_design.md)** - Detailed database schema, API specs, UI design system

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Development Setup

#### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd Customizable_Inventory_Management_System

# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### Option 2: Manual Setup

**Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
alembic upgrade head

# Run development server
uvicorn app.main:app --reload --port 8000
```

**Frontend Setup**

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Default Credentials (Development)

- **Email**: admin@example.com
- **Password**: Admin@123456

---

## 📦 Project Structure

```
Customizable_Inventory_Management_System/
├── frontend/                    # Next.js application
│   ├── app/                    # Pages and layouts
│   ├── components/             # React components
│   ├── lib/                    # Utilities and hooks
│   ├── store/                  # Zustand stores
│   ├── styles/                 # Styling
│   └── public/                 # Static assets
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── database/          # Database and models
│   │   ├── services/          # Business logic
│   │   ├── core/              # Auth and security
│   │   ├── schemas/           # Pydantic DTOs
│   │   └── main.py            # App entry point
│   ├── migrations/            # Alembic DB migrations
│   ├── tests/                 # Test suite
│   └── requirements.txt
│
├── docker-compose.yml         # Local development
├── documentation.md           # Original project docs
├── tech_stack.md             # Technology rationale
├── architecture.md           # System architecture
├── system_design.md          # Detailed design specs
├── SRS.md                    # Requirements spec
└── README.md                 # This file
```

---

## 🔄 Development Workflow

### Git Workflow

```
main (production)
  ↑
  ├─ develop (staging)
  │   ├─ feature/auth-improvements
  │   ├─ feature/inventory-sync
  │   ├─ bugfix/search-filtering
  │   └─ ...
```

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Production hotfixes
- `docs/description` - Documentation updates

### Commit Standards

```
[type]: Description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat: Add stock transfer between warehouses
```

### Pull Request Process

1. Create PR from feature branch to main/develop
2. Address code review comments
3. All tests must pass
4. Minimum 1 approval required
5. Merge and deploy

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
pnpm test

# With coverage
pnpm test:coverage

# E2E tests
pnpm e2e

# Watch mode
pnpm test --watch
```

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# With coverage
pytest --cov=app

# Specific test file
pytest tests/test_auth.py

# Watch mode
pytest-watch
```

### Test Coverage Goals

- Backend: >85% code coverage
- Frontend: >80% component coverage
- E2E: All critical user workflows

---

## 📊 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Key endpoints:

```
Authentication:
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh-token

Inventory:
  GET    /api/v1/inventory
  PUT    /api/v1/inventory/{id}
  POST   /api/v1/inventory/adjust-stock
  POST   /api/v1/inventory/transfer

Products:
  GET    /api/v1/products
  POST   /api/v1/products
  PUT    /api/v1/products/{id}

Orders:
  GET    /api/v1/orders
  POST   /api/v1/orders
  GET    /api/v1/orders/{id}

Reports:
  GET    /api/v1/reports/dashboard
  GET    /api/v1/reports/inventory-status

See system_design.md for complete API specification
```

---

## 🔐 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (Bcrypt)
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection (React escaping)
- ✅ CORS validation
- ✅ Rate limiting
- ✅ Complete audit logging
- ✅ HTTPS enforced (production)

---

## 📈 Performance Targets

| Metric         | Target          |
| -------------- | --------------- |
| Page Load Time | < 3 seconds     |
| API Response   | < 500ms (95th%) |
| Authentication | < 300ms         |
| Database Query | < 50ms          |
| TTFB           | < 1 second      |
| LCP            | < 2.5 seconds   |

---

## 🚢 Deployment

### Production Deployment Options

#### Vercel (Frontend)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Configure environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### Railway/Render/DigitalOcean (Backend)

```bash
# Backend deployment with environment variables
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=https://yourdomain.com
```

#### Database Migration (SQLite → PostgreSQL)

See [migration guide](./docs/MIGRATION.md) for PostgreSQL setup.

---

## 🤝 Team Collaboration & Agile Process

### Sprint Structure

- **Sprint Length**: 2 weeks
- **Sprint Planning**: Monday 10 AM
- **Daily Standup**: 15 minutes (Wed/Fri)
- **Sprint Review**: Friday 4 PM
- **Sprint Retro**: Friday 5 PM

### Roles & Responsibilities

**Team Lead / Architect**

- Architecture decisions
- Code review oversight
- Cross-domain integration

**Frontend Developer**

- UI/UX implementation
- Component development
- E2E testing

**Backend Developer**

- API development
- Database schema
- Business logic

**QA/Tester**

- Test planning
- Manual testing
- Performance testing

### Agile Practices

- Kanban board for task tracking (GitHub Projects)
- User story format for requirements
- Acceptance criteria for each task
- Burn-down tracking
- Retrospective insights

---

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**

```
Solution: Update CORS_ORIGINS in backend .env
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

**Database Connection Failed**

```
Solution: Ensure SQLite file path is correct and writable
Check: DATABASE_URL in backend .env
```

**Port Already in Use**

```
Solution: Kill process or use different port
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
```

**Token Expired**

```
Solution: Refresh token automatically handled in interceptors
Manual refresh: POST /api/v1/auth/refresh-token
```

---

## 📞 Support & Contributing

### Getting Help

1. Check documentation in `/docs`
2. Search existing GitHub issues
3. Create new issue with details
4. Contact team lead

### Contributing Guidelines

1. Fork the repository
2. Create feature branch
3. Make changes with clear commits
4. Write/update tests
5. Submit pull request
6. Address reviews
7. Merge and close

---

## 📝 License

[Your License Here]

---

## 🎯 Roadmap

### Phase 1 (MVP) - Q1 2026

- [x] Core auth system
- [x] Product management
- [x] Inventory tracking
- [x] Basic orders
- [x] Dashboard

### Phase 2 - Q2 2026

- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Cycle counting
- [ ] Supplier portal
- [ ] Mobile app (PWA)

### Phase 3 - Q3 2026

- [ ] PostgreSQL migration
- [ ] Microservices split
- [ ] Real-time WebSocket sync
- [ ] AI-powered forecasting
- [ ] Advanced analytics

---

## 📊 Status: Ready for Development

**Documentation**: ✅ Complete  
**Architecture**: ✅ Approved  
**API Specs**: ✅ Defined  
**Design System**: ✅ Ready  
**Testing Plan**: ✅ Created

---

**Last Updated**: March 2026  
**Next Review**: Sprint Planning  
**Status**: Active Development

For detailed planning and work allocation, see [AGILE.md](./AGILE.md).
