# Project Index & Navigation

## 📚 Documentation Structure

### Getting Started

1. **[README.md](../README.md)** - Overview, quick start, features
2. **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - Project overview for leads
3. **[AGILE.md](./AGILE.md)** - Sprint planning & team workflow

### Architecture & Design

4. **[architecture.md](./architecture.md)** - System architecture, data flow
5. **[system_design.md](./system_design.md)** - Database schema, API specs, UI design
6. **[tech_stack.md](./tech_stack.md)** - Technology choices & rationale

### Requirements & Specifications

7. **[SRS.md](./SRS.md)** - Complete requirements specification
8. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development standards & code guidelines

### Operations & Deployment

9. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to staging/production
10. **[INDEX.md](./INDEX.md)** - This file

---

## 🗂️ Directory Structure

```
Customizable_Inventory_Management_System/
│
├── 📄 README.md                    # Main project overview
├── 📄 start.bat                    # Local startup helper (Windows)
├── 📁 docs/                        # Project documentation
│   ├── INDEX.md
│   ├── START_HERE.md
│   ├── PROJECT_DELIVERY_SUMMARY.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── AGILE.md
│   ├── SRS.md
│   ├── architecture.md
│   ├── system_design.md
│   ├── tech_stack.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── 📁 frontend/                    # Next.js application
├── 📁 backend/                     # FastAPI application
└── 📄 docker-compose.yml           # Local dev environment
```

---

## 🎯 Quick Navigation by Role

### 👨‍💼 Project Manager / Stakeholder

1. Start: [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
2. Requirements: [SRS.md](./SRS.md)
3. Progress: [AGILE.md](./AGILE.md) (Sprint section)
4. Timeline: [AGILE.md](./AGILE.md#-timeline-overview)

### 🏗️ Tech Lead / Architect

1. Start: [architecture.md](./architecture.md)
2. Design Details: [system_design.md](./system_design.md)
3. Tech Choices: [tech_stack.md](./tech_stack.md)
4. Team Coordination: [AGILE.md](./AGILE.md#-team-structure--roles)
5. Standards: [CONTRIBUTING.md](./CONTRIBUTING.md)

### 💻 Backend Developer

1. Start: [README.md](../README.md) (Quick Start)
2. Architecture: [architecture.md](./architecture.md) (Backend section)
3. API Specs: [system_design.md](./system_design.md) (API section)
4. Tasks: [AGILE.md](./AGILE.md) (Backend allocation)
5. Standards: [CONTRIBUTING.md](./CONTRIBUTING.md)
6. Setup: `backend/.env.example` and `backend/requirements.txt`

### 🎨 Frontend Developer

1. Start: [README.md](../README.md) (Quick Start)
2. UI Design: [system_design.md](./system_design.md) (UI/UX section)
3. Architecture: [architecture.md](./architecture.md) (Frontend section)
4. Tasks: [AGILE.md](./AGILE.md) (Frontend allocation)
5. Standards: [CONTRIBUTING.md](./CONTRIBUTING.md)
6. Setup: `frontend/.env.example`

### 🧪 QA / Full-Stack Developer

1. Start: [README.md](../README.md)
2. Requirements: [SRS.md](./SRS.md)
3. Test Strategy: [docs/TESTING.md](./TESTING.md)
4. Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
5. Tasks: [AGILE.md](./AGILE.md) (QA allocation)
6. Standards: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📋 Key Decisions Made

See [docs/ADRs/](./ADRs/) for Architecture Decision Records (ADRs):

- ADR-0001: Why Next.js for Frontend
- ADR-0002: Why FastAPI for Backend
- ADR-0003: Why SQLite for MVP

---

## 🔄 Development Workflow

```
1. Review Documentation
   ↓
2. Check Current Tasks (AGILE.md)
   ↓
3. Create Branch (CONTRIBUTING.md)
   ↓
4. Develop & Test (Standards in CONTRIBUTING.md)
   ↓
5. Submit PR (Follow PR template)
   ↓
6. Code Review (CONTRIBUTING.md#5-pull-request-process)
   ↓
7. Merge & Deploy (DEPLOYMENT.md)
```

---

## 📞 Quick Reference

### Setup Commands

```bash
# Backend
cd backend && python -m venv venv && venv/Scripts/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend && pnpm install && pnpm dev

# Docker (Recommended)
docker-compose up -d
```

### Important URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- GitHub: [ArnavKarwa07/Customizable_Inventory_Management_System](https://github.com/ArnavKarwa07/Customizable_Inventory_Management_System)

### Key Contacts

- Tech Lead: [TBD]
- Backend Lead: [TBD]
- Frontend Lead: [TBD]
- QA Lead: [TBD]

---

## ✅ Checklist for New Team Members

- [ ] Read [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)
- [ ] Review [architecture.md](./architecture.md)
- [ ] Read role-specific documentation (see navigation above)
- [ ] Clone repository and setup environment
- [ ] Run local development environment
- [ ] Create first feature branch
- [ ] Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- [ ] Make first code contribution
- [ ] Submit PR following guidelines

---

## 🔗 External Resources

### Next.js

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### FastAPI

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

### Tools

- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Git Documentation](https://git-scm.com/doc)

---

## 📝 Document Updates

Last Updated: March 27, 2026
Version: 1.0
Maintainer: Development Team

---

**Ready to contribute?** Start with your role's documentation above! 🚀
