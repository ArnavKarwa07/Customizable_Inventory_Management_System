# System Architecture - Customizable Inventory Management System

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Next.js)                     │
│  [UI Components] [State Management] [API Client] [Theme]        │
│              ↓                                                   │
├─────────────────────────────────────────────────────────────────┤
│              HTTP/REST API (Axios)                              │
│              JWT Authentication, CORS                           │
├─────────────────────────────────────────────────────────────────┤
│                 BACKEND LAYER (FastAPI)                         │
│  [Authentication] [API Routes] [Business Logic] [Validation]    │
│              ↓                                                   │
├─────────────────────────────────────────────────────────────────┤
│              DATABASE LAYER (SQLite + SQLAlchemy)               │
│  [User Data] [Inventory] [Transactions] [Audit Logs]            │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Layered Architecture

### 2.1 Frontend Architecture (Next.js)

```
Frontend/
├── app/
│   ├── (auth)/              # Auth pages (login, register)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/         # Protected routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── inventory/       # Inventory management
│   │   ├── warehouses/      # Warehouse management
│   │   ├── products/        # Product catalog
│   │   ├── orders/          # Order management
│   │   ├── reports/         # Analytics & reports
│   │   ├── suppliers/       # Supplier management
│   │   ├── settings/        # User & system settings
│   │   └── profile/         # User profile
│   ├── api/                 # API routes (optional, for Next.js API)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
│
├── components/
│   ├── common/              # Reusable components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   ├── Modal/
│   │   └── Loading/
│   ├── forms/               # Form components
│   │   ├── LoginForm/
│   │   ├── ProductForm/
│   │   ├── InventoryForm/
│   │   └── SupplierForm/
│   ├── dashboard/           # Dashboard specific
│   │   ├── StatCard/
│   │   ├── ChartCard/
│   │   ├── MetricsGrid/
│   │   └── RecentActivity/
│   ├── table/               # Table components
│   │   ├── DataTable/
│   │   ├── Pagination/
│   │   └── Filters/
│   └── ui/                  # Shadcn/UI components
│
├── lib/
│   ├── api/                 # API client & utilities
│   │   ├── client.ts        # Axios instance
│   │   ├── endpoints.ts     # API routes
│   │   └── interceptors.ts  # Request/response interceptors
│   ├── auth/                # Auth utilities
│   │   ├── jwt.ts           # JWT handling
│   │   ├── session.ts       # Session management
│   │   └── guards.ts        # Route guards
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useInventory.ts
│   │   ├── useAsync.ts
│   │   └── useForm.ts
│   ├── utils/               # Utility functions
│   │   ├── format.ts        # Formatting helpers
│   │   ├── date.ts          # Date utilities
│   │   ├── validation.ts    # Form validation
│   │   └── constants.ts     # Constants
│   └── types/               # TypeScript types
│       ├── index.ts
│       ├── api.ts
│       ├── entities.ts
│       └── forms.ts
│
├── context/                 # React Context for state
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
│
├── store/                   # Zustand stores
│   ├── authStore.ts
│   ├── inventoryStore.ts
│   ├── uiStore.ts
│   └── notificationStore.ts
│
├── styles/
│   ├── globals.css          # Global styles
│   ├── variables.css        # CSS variables & theme
│   └── animations.css       # Animations
│
├── public/                  # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── middleware.ts            # Next.js middleware (auth checks)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 Backend Architecture (FastAPI)

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration & settings
│   ├── dependencies.py      # FastAPI dependencies
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── __init__.py
│   │   ├── CORSMiddleware.py
│   │   ├── JWTMiddleware.py
│   │   ├── LoggingMiddleware.py
│   │   └── RateLimitMiddleware.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py    # Main router
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   └── schemas.py
│   │   │   ├── users/       # User management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── inventory/   # Inventory management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── products/    # Product catalog
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── orders/      # Order management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── warehouses/  # Warehouse management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── reports/     # Analytics & reports
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   ├── suppliers/   # Supplier management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── service.py
│   │   │   └── audit/       # Audit logs
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       └── schemas.py
│   │
│   ├── database/            # Database layer
│   │   ├── __init__.py
│   │   ├── session.py       # Database session management
│   │   ├── base.py          # Base model for all ORM models
│   │   └── models.py        # All SQLAlchemy models
│   │       ├── User
│   │       ├── Role
│   │       ├── Product
│   │       ├── Inventory
│   │       ├── Warehouse
│   │       ├── StockMovement
│   │       ├── Order
│   │       ├── Supplier
│   │       └── AuditLog
│   │
│   ├── core/                # Core business logic
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication logic
│   │   ├── security.py      # Security utilities (hashing, JWT)
│   │   ├── rbac.py          # Role-based access control
│   │   └── exceptions.py    # Custom exceptions
│   │
│   ├── services/            # Business logic services
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── inventory_service.py
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── warehouse_service.py
│   │   ├── report_service.py
│   │   ├── supplier_service.py
│   │   ├── audit_service.py
│   │   └── email_service.py # Email notifications
│   │
│   ├── schemas/             # Pydantic schemas (DTOs)
│   │   ├── __init__.py
│   │   ├── base.py          # Base schemas
│   │   ├── user.py
│   │   ├── inventory.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── warehouse.py
│   │   ├── report.py
│   │   ├── supplier.py
│   │   └── error.py         # Error response schemas
│   │
│   ├── utils/               # Utility functions
│   │   ├── __init__.py
│   │   ├── logger.py        # Logging
│   │   ├── validators.py    # Custom validators
│   │   ├── formatters.py    # Data formatters
│   │   ├── exporters.py     # CSV/Excel export
│   │   ├── Constants.py
│   │   └── helpers.py
│   │
│   └── tasks/               # Background tasks
│       ├── __init__.py
│       ├── email_tasks.py
│       ├── report_tasks.py
│       ├── cleanup_tasks.py
│       └── scheduler.py     # APScheduler configuration
│
├── migrations/              # Alembic migration files
│   ├── versions/
│   └── env.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest configuration
│   ├── test_auth.py
│   ├── test_inventory.py
│   ├── test_products.py
│   ├── test_orders.py
│   └── test_reports.py
│
├── logs/                    # Application logs
├── .env                     # Environment variables
├── .env.example             # Example environment
├── requirements.txt         # Python dependencies
├── pyproject.toml           # Poetry configuration (optional)
├── docker-compose.yml       # Docker compose for local dev
├── Dockerfile               # Docker image for backend
├── pytest.ini               # Pytest configuration
└── README.md                # Backend documentation
```

### 2.3 Database Architecture (SQLite)

```
INVENTORY_MANAGEMENT_DB
├── users (USER TABLE)
│   ├── id (PK)
│   ├── email (UNIQUE)
│   ├── username (UNIQUE)
│   ├── password_hash
│   ├── first_name
│   ├── last_name
│   ├── role_id (FK → roles)
│   ├── warehouse_id (FK → warehouses)
│   ├── is_active
│   ├── created_at
│   ├── updated_at
│   └── last_login
│
├── roles (ROLES TABLE)
│   ├── id (PK)
│   ├── name (UNIQUE)
│   ├── description
│   ├── permissions (JSON)
│   ├── created_at
│   └── updated_at
│
├── warehouses (WAREHOUSES TABLE)
│   ├── id (PK)
│   ├── name
│   ├── location
│   ├── latitude
│   ├── longitude
│   ├── address
│   ├── capacity
│   ├── is_active
│   ├── created_at
│   └── updated_at
│
├── products (PRODUCTS TABLE)
│   ├── id (PK)
│   ├── sku (UNIQUE)
│   ├── name
│   ├── description
│   ├── category
│   ├── unit_of_measure
│   ├── cost_price
│   ├── selling_price
│   ├── reorder_level
│   ├── lead_time_days
│   ├── is_active
│   ├── attributes (JSON)
│   ├── created_at
│   ├── updated_at
│   └── created_by (FK → users)
│
├── inventory (INVENTORY TABLE)
│   ├── id (PK)
│   ├── product_id (FK → products)
│   ├── warehouse_id (FK → warehouses)
│   ├── quantity_on_hand
│   ├── quantity_reserved
│   ├── quantity_available
│   ├── quantity_damaged
│   ├── last_counted_at
│   ├── reorder_quantity
│   ├── created_at
│   └── updated_at
│
├── stock_movements (STOCK MOVEMENTS TABLE)
│   ├── id (PK)
│   ├── inventory_id (FK → inventory)
│   ├── type (IN/OUT/ADJUSTMENT/TRANSFER)
│   ├── quantity
│   ├── reference_type (ORDER/RETURN/TRANSFER)
│   ├── reference_id
│   ├── from_warehouse (FK → warehouses)
│   ├── to_warehouse (FK → warehouses)
│   ├── reason
│   ├── performed_by (FK → users)
│   ├── notes
│   ├── created_at
│   └── updated_at
│
├── orders (ORDERS TABLE)
│   ├── id (PK)
│   ├── order_number (UNIQUE)
│   ├── type (PURCHASE/SALES)
│   ├── supplier_id (FK → suppliers)
│   ├── warehouse_id (FK → warehouses)
│   ├── status (PENDING/CONFIRMED/SHIPPED/DELIVERED)
│   ├── order_date
│   ├── delivery_date
│   ├── total_amount
│   ├── notes
│   ├── created_by (FK → users)
│   ├── created_at
│   └── updated_at
│
├── order_items (ORDER ITEMS TABLE)
│   ├── id (PK)
│   ├── order_id (FK → orders)
│   ├── product_id (FK → products)
│   ├── quantity
│   ├── unit_price
│   ├── total_price
│   ├── received_quantity
│   └── notes
│
├── suppliers (SUPPLIERS TABLE)
│   ├── id (PK)
│   ├── name
│   ├── email
│   ├── phone
│   ├── address
│   ├── city
│   ├── country
│   ├── website
│   ├── lead_time_days
│   ├── is_active
│   ├── contact_person
│   ├── created_at
│   └── updated_at
│
└── audit_logs (AUDIT TABLE)
    ├── id (PK)
    ├── user_id (FK → users)
    ├── action
    ├── entity_type
    ├── entity_id
    ├── old_values (JSON)
    ├── new_values (JSON)
    ├── ip_address
    ├── timestamp
    └── details (JSON)
```

## 3. Data Flow Architecture

### 3.1 Authentication Flow

```
User Input (Login)
    ↓
Frontend Form Validation
    ↓
POST /api/v1/auth/login (Credentials)
    ↓
Backend: Validate credentials against database
    ↓
Backend: Generate JWT token + Refresh token
    ↓
Response with tokens
    ↓
Frontend: Store tokens (localStorage/cookies)
    ↓
Add JWT to Authorization header for future requests
```

### 3.2 Inventory Operation Flow

```
User Action (Add/Update Stock)
    ↓
Frontend Form Submission
    ↓
Frontend Validation + Loading State
    ↓
POST/PUT /api/v1/inventory/{id}
    ↓
Backend: Validate request (Pydantic)
    ↓
Backend: Check permissions (RBAC)
    ↓
Backend: Execute business logic
    ↓
Backend: Update database + Create audit log
    ↓
Response with updated data
    ↓
Frontend: Update state (Zustand)
    ↓
UI Re-render
    ↓
Success notification
```

### 3.3 Real-time Dashboard Updates

```
Backend Database Change
    ↓
Trigger audit log entry
    ↓
Optional: Emit WebSocket event (future enhancement)
    ↓
Frontend Polling: GET /api/v1/dashboard/metrics (configurable interval)
    ↓
Response with current KPIs
    ↓
Update React Query cache
    ↓
Zustand store update
    ↓
Component re-render with new data
```

## 4. Component Interaction

### 4.1 Frontend Components Hierarchy

```
RootLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   ├── NavItems
│   └── UserProfile
├── Main (Page Content)
│   ├── SelectedPage Component
│   │   ├── Filters
│   │   ├── DataTable
│   │   ├── Modals
│   │   └── Forms
│   └── Breadcrumbs
└── Footer
```

### 4.2 State Management Pattern

```
Component
    ↓
useAuth Hook (AuthContext)
    ↓
authStore (Zustand)
    ↓
API Call (Axios)
    ↓
Backend Service
    ↓
Database
```

## 5. API Communication Pattern

### Request/Response Cycle

```
Frontend
    ↓
Middleware (interceptors)
    ├── Add JWT token
    ├── Add request ID
    └── Log request
    ↓
FastAPI Backend
    ↓
Middleware
    ├── Validate JWT
    ├── Rate limiting
    ├── CORS check
    └── Log request
    ↓
Route Handler
    ├── Validate input (Pydantic)
    ├── Check permissions
    └── Execute business logic
    ↓
Service Layer
    ├── Query database
    ├── Transform data
    └── Apply business rules
    ↓
Database Query (SQLAlchemy)
    ↓
Response
    ├── Serialize data
    ├── Add metadata
    └── Return to frontend
    ↓
Frontend interceptor (response)
    ├── Handle errors
    ├── Update cache
    └── Notify user
```

## 6. Deployment Architecture

### Development

```
Docker Compose (Local)
├── Next.js (Port 3000)
├── FastAPI (Port 8000)
└── SQLite (Volume)
```

### Production

```
Cloud Provider (AWS/DigitalOcean/Vercel)
├── Frontend
│   └── Hosted on Vercel/CloudFront
├── Backend
│   └── API Server (EC2/App Platform)
├── Database
│   └── SQLite file or PostgreSQL
└── Storage
    └── S3/Cloud Storage
```

## 7. Security Architecture

```
Frontend
    ↓
HTTPS (encrypted transmission)
    ↓
Backend
    ├── CORS validation
    ├── JWT verification
    ├── Rate limiting
    └── Input validation
    ↓
Database
    ├── Parameterized queries
    ├── Role-based access
    ├── Audit logging
    └── Data encryption (optional)
```

## 8. Scalability Considerations

### Current (MVP)

- Single backend instance
- SQLite database
- Single frontend deployment

### Future Enhancements

- Load balancer for multiple backend instances
- PostgreSQL for better concurrency
- Redis for caching
- Message queue for async operations
- CDN for static assets
- Database read replicas for reporting

---

**Architecture Principles:**

- **Separation of Concerns**: Each layer has specific responsibilities
- **DRY (Don't Repeat Yourself)**: Reusable components and services
- **SOLID Principles**: Maintainable and scalable code
- **Security First**: Authentication, authorization, and validation at every layer
- **Performance**: Optimized queries, caching strategies, and efficient rendering
