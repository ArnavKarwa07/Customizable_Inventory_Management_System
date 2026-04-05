# StockPilot — Customizable Inventory Management System

A production-ready, **multi-tenant** inventory management platform built with **Next.js 14** (frontend), **FastAPI** (backend), and **SQLite** (database). Features organization-based data isolation, a four-tier role-based access control system, full CRUD operations for every resource, and a premium glassmorphism UI.

> **v2.0** — Multi-Tenancy & RBAC Upgrade (April 2026)

---

## 🌟 Features

### Multi-Tenancy

- 🏢 **Organization Workspaces** — Create isolated organizations with unique slugs
- 🔒 **Data Isolation** — All queries scoped to the user's `org_id`
- 📨 **User Invitations** — Owners/admins invite users with preset roles and temporary passwords
- 🔑 **Org-Scoped Login** — Users sign in with org slug + email + password

### Role-Based Access Control (RBAC)

| Capability           | Owner | Admin | Manager | Staff |
|----------------------|:-----:|:-----:|:-------:|:-----:|
| Org Settings         |  ✅   |       |         |       |
| Manage Users         |  ✅   |  ✅   |         |       |
| Delete Resources     |  ✅   |  ✅   |         |       |
| Create/Edit Resources|  ✅   |  ✅   |   ✅    |       |
| Create Orders        |  ✅   |  ✅   |   ✅    |  ✅   |
| View Data            |  ✅   |  ✅   |   ✅    |  ✅   |
| Adjust Stock         |  ✅   |  ✅   |   ✅    |  ✅   |
| Transfer Stock       |  ✅   |  ✅   |   ✅    |       |
| View Audit Log       |  ✅   |  ✅   |         |       |

### Inventory Operations

- 📦 **Products** — Full CRUD with SKU, category, supplier, and low-stock thresholds
- 📂 **Categories** — Organize products into categories
- 🤝 **Suppliers** — Manage supplier directory with contact details
- 🏭 **Warehouses** — Multiple warehouse support with activation/deactivation
- 🏷️ **Stock Tracking** — Real-time inventory grid across all warehouses
- 🔄 **Stock Adjustments** — Increase/decrease stock with reason tracking
- 🚚 **Stock Transfers** — Transfer between warehouses with full movement history
- 🛒 **Orders** — Create, track status (draft → pending → completed), and delete draft orders
- ⚠️ **Low Stock Alerts** — Automatic detection based on configurable thresholds

### Enterprise Features

- 📋 **Audit Trail** — Every action logged with user, timestamp, and details
- 📊 **Dashboard** — Stat cards, low-stock alerts, and recent activity feed
- 👥 **Team Management** — Invite users, assign/change roles, deactivate accounts
- 🌙 **Dark/Light Mode** — Premium glassmorphism design with gradient mesh backgrounds
- 🔐 **JWT Auth** — Access + refresh token rotation with org_id in token payload

---

## 🏗️ Architecture

```
Frontend (Next.js 14)  →  REST API (FastAPI)  →  Database (SQLite)
     │                         │                        │
     ├─ App Router             ├─ Scope-Based RBAC      ├─ Organizations
     ├─ Glassmorphism UI       ├─ Org-Scoped Queries    ├─ Users + Roles
     ├─ Axios + Interceptors   ├─ Audit Logging         ├─ Products
     ├─ Auth Storage           ├─ JWT Tokens            ├─ Inventory
     └─ Client-Side Scopes    └─ Pydantic Validation    ├─ Orders
                                                        ├─ Suppliers
                                                        ├─ Categories
                                                        └─ Audit Logs
```

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Purpose                                    |
|--------------------|--------------------------------------------|
| Next.js 14         | React framework (App Router, TypeScript)   |
| Tailwind CSS       | Utility-first CSS framework                |
| Manrope + IBM Plex | Premium typography via Google Fonts         |
| Axios              | HTTP client with token interceptors        |
| CSS Custom Props   | Design token system (glassmorphism, themes)|

### Backend

| Technology         | Purpose                                    |
|--------------------|--------------------------------------------|
| FastAPI            | Async Python web framework                 |
| SQLAlchemy 2.0     | ORM with type-annotated models             |
| SQLite             | Embedded database (PostgreSQL-ready)       |
| PyJWT              | JWT access + refresh token management      |
| bcrypt             | Password hashing                           |
| Pydantic v2        | Request/response validation                |
| Uvicorn            | ASGI server                                |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **Git**

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server (auto-creates DB + seeds roles)
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### First-Time Setup

1. Open `http://localhost:3000`
2. Click **Create Organization**
3. Fill in organization name, slug, and owner credentials
4. You're in! Start adding products, warehouses, and placing orders

> **No default credentials** — You create your org and owner account on first run.

---

## 📦 Project Structure

```
Customizable_Inventory_Management_System/
├── frontend/                     # Next.js 14 application
│   ├── app/                     # Pages (App Router)
│   │   ├── dashboard/           # Dashboard with stats
│   │   ├── products/            # Product CRUD
│   │   ├── orders/              # Order management
│   │   ├── inventory/           # Stock grid, adjust, transfer
│   │   ├── warehouses/          # Warehouse management
│   │   ├── suppliers/           # Supplier directory
│   │   ├── categories/          # Category management
│   │   ├── settings/            # Org settings + user management
│   │   ├── audit/               # Audit trail viewer
│   │   ├── profile/             # User profile
│   │   ├── login/               # Org-scoped login
│   │   └── register/            # Create organization
│   ├── components/              # Shared UI components
│   │   └── app-shell.tsx        # Layout with sidebar + header
│   ├── lib/                     # Utilities
│   │   ├── api-client.ts        # Axios with auth interceptors
│   │   └── auth-storage.ts      # Token + session management
│   └── middleware.ts            # Route protection
│
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── api/v1/              # API route modules
│   │   │   ├── auth.py          # Org create, login, invite
│   │   │   ├── products.py      # Product CRUD
│   │   │   ├── orders.py        # Order CRUD + status
│   │   │   ├── inventory.py     # Stock adjust, transfer, movements
│   │   │   ├── warehouses.py    # Warehouse CRUD
│   │   │   ├── suppliers.py     # Supplier CRUD
│   │   │   ├── categories.py    # Category CRUD
│   │   │   ├── organizations.py # Org info + update
│   │   │   ├── users.py         # User management
│   │   │   └── audit.py         # Audit log viewer
│   │   ├── database/
│   │   │   ├── models.py        # SQLAlchemy models
│   │   │   ├── base.py          # Declarative base
│   │   │   └── session.py       # DB engine + session
│   │   ├── schemas/             # Pydantic DTOs
│   │   ├── core/
│   │   │   ├── config.py        # Environment settings
│   │   │   ├── security.py      # Password hashing + JWT
│   │   │   └── deps.py          # Auth + RBAC dependencies
│   │   ├── services/
│   │   │   ├── bootstrap.py     # Role seeding
│   │   │   └── audit_service.py # Audit logging utility
│   │   └── main.py              # FastAPI app factory
│   └── requirements.txt
│
├── docs/                         # Project documentation
└── README.md                     # This file
```

---

## 📊 API Reference

Once the backend is running: **Swagger UI** at `http://localhost:8000/docs`

### Authentication

| Method | Endpoint                   | Description                      | Auth  |
|--------|----------------------------|----------------------------------|-------|
| POST   | `/api/v1/auth/org/create`  | Create org + owner account       | —     |
| POST   | `/api/v1/auth/login`       | Login (org_slug + email + pass)  | —     |
| POST   | `/api/v1/auth/register`    | Self-register as staff           | —     |
| POST   | `/api/v1/auth/invite`      | Invite user with role            | ✅    |
| POST   | `/api/v1/auth/refresh`     | Refresh tokens                   | —     |
| POST   | `/api/v1/auth/logout`      | Revoke refresh token             | ✅    |

### Resources (all org-scoped, auth required)

| Resource     | List          | Create        | Update             | Delete             |
|--------------|---------------|---------------|--------------------|--------------------|
| Products     | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |
| Orders       | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |
| Warehouses   | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |
| Suppliers    | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |
| Categories   | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |
| Users        | `GET`         | `POST`        | `PATCH /{id}`      | `DELETE /{id}`     |

### Inventory

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/v1/inventory`             | List all stock levels    |
| POST   | `/api/v1/inventory/adjust`      | Adjust stock (+/-)       |
| POST   | `/api/v1/inventory/transfer`    | Transfer between warehouses |
| GET    | `/api/v1/inventory/low-stock`   | Low stock alerts         |
| GET    | `/api/v1/inventory/movements`   | Stock movement history   |

### Other

| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| GET    | `/api/v1/users/me`  | Current user profile |
| GET    | `/api/v1/org`       | Org details          |
| PATCH  | `/api/v1/org`       | Update org name      |
| GET    | `/api/v1/audit`     | Audit log            |

---

## 🔐 Security

- ✅ JWT access + refresh token rotation
- ✅ Scope-based RBAC with permission matrix
- ✅ Password hashing (bcrypt, 72-byte safe)
- ✅ Org-scoped data isolation (every query filters by `org_id`)
- ✅ Role hierarchy enforcement (can't assign higher role)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS protection (React escaping)
- ✅ CORS whitelisting
- ✅ Complete audit trail

---

## 🎨 Design System

The frontend uses a custom design token system with CSS custom properties:

- **Glassmorphism** — Frosted glass panels with backdrop blur
- **Gradient Mesh** — Multi-point radial gradient backgrounds
- **Stat Cards** — Color-coded gradient cards for KPIs
- **Badge System** — Role badges (owner/admin/manager/staff) and status badges
- **Micro-animations** — Rise-in, fade, and pulse-glow effects
- **Dark Mode** — Full dark theme with separate token set

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Update `CORS_ORIGINS` in backend `.env` |
| DB not created | Server auto-creates `inventory.db` on first run |
| Login fails  | Ensure you provide the org slug, not just email |
| 403 Forbidden | Your role lacks the required scope for this action |
| bcrypt error | Handled automatically — passwords truncated to 72 bytes |

---

## 🎯 Roadmap

### ✅ v2.0 (Current) — Multi-Tenancy & RBAC

- [x] Organization-based multi-tenancy
- [x] 4-tier RBAC (owner, admin, manager, staff)
- [x] Full CRUD for all resources
- [x] Supplier & Category management
- [x] Stock adjustments & transfers
- [x] Audit trail
- [x] Premium UI overhaul

### 🔮 v3.0 (Planned)

- [ ] PostgreSQL migration
- [ ] Email notifications & alerts
- [ ] Barcode/QR scanning
- [ ] Advanced reporting & analytics
- [ ] CSV/PDF data exports
- [ ] PWA mobile support

---

**Last Updated**: April 2026
**Version**: 2.0.0
**Status**: Production-Ready

For detailed documentation, see the [docs/](./docs/) directory.
