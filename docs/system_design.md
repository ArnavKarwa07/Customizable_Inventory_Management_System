# System Design — StockPilot IMS v2.0

## Database Schema

### Organizations
```sql
organizations (
  id          INTEGER PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(80)  UNIQUE NOT NULL,
  created_at  DATETIME     DEFAULT NOW
)
```

### Roles
```sql
roles (
  id          INTEGER PRIMARY KEY,
  name        VARCHAR(50)  UNIQUE NOT NULL,   -- owner, admin, manager, staff
  description VARCHAR(255),
  level       INTEGER      DEFAULT 99         -- 0=owner, 1=admin, 2=manager, 3=staff
)
```

### Users
```sql
users (
  id            INTEGER PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN      DEFAULT TRUE,
  role_id       INTEGER      REFERENCES roles(id),
  org_id        INTEGER      REFERENCES organizations(id),
  created_at    DATETIME     DEFAULT NOW
)
```

### Products
```sql
products (
  id                  INTEGER PRIMARY KEY,
  org_id              INTEGER      REFERENCES organizations(id),
  sku                 VARCHAR(80)  NOT NULL,
  name                VARCHAR(200) NOT NULL,
  description         TEXT,
  unit_price          FLOAT        DEFAULT 0,
  low_stock_threshold INTEGER      DEFAULT 5,
  category_id         INTEGER      REFERENCES categories(id),
  supplier_id         INTEGER      REFERENCES suppliers(id),
  is_active           BOOLEAN      DEFAULT TRUE,
  created_at          DATETIME     DEFAULT NOW
)
```

### Categories
```sql
categories (
  id          INTEGER PRIMARY KEY,
  org_id      INTEGER      REFERENCES organizations(id),
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  created_at  DATETIME     DEFAULT NOW
)
```

### Suppliers
```sql
suppliers (
  id            INTEGER PRIMARY KEY,
  org_id        INTEGER      REFERENCES organizations(id),
  name          VARCHAR(200) NOT NULL,
  contact_email VARCHAR(255),
  phone         VARCHAR(50),
  address       TEXT,
  is_active     BOOLEAN      DEFAULT TRUE,
  created_at    DATETIME     DEFAULT NOW
)
```

### Warehouses
```sql
warehouses (
  id         INTEGER PRIMARY KEY,
  org_id     INTEGER      REFERENCES organizations(id),
  name       VARCHAR(120) NOT NULL,
  code       VARCHAR(30)  NOT NULL,
  address    TEXT,
  is_active  BOOLEAN      DEFAULT TRUE,
  created_at DATETIME     DEFAULT NOW
)
```

### Inventory
```sql
inventory (
  id           INTEGER PRIMARY KEY,
  product_id   INTEGER REFERENCES products(id),
  warehouse_id INTEGER REFERENCES warehouses(id),
  quantity     INTEGER DEFAULT 0,
  updated_at   DATETIME DEFAULT NOW
)
```

### Stock Movements
```sql
stock_movements (
  id                 INTEGER PRIMARY KEY,
  product_id         INTEGER REFERENCES products(id),
  warehouse_id       INTEGER REFERENCES warehouses(id),
  change             INTEGER NOT NULL,
  reason             VARCHAR(255) NOT NULL,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at         DATETIME DEFAULT NOW
)
```

### Orders
```sql
orders (
  id                 INTEGER PRIMARY KEY,
  org_id             INTEGER      REFERENCES organizations(id),
  order_number       VARCHAR(60)  UNIQUE NOT NULL,
  status             VARCHAR(40)  DEFAULT 'draft',
  warehouse_id       INTEGER      REFERENCES warehouses(id),
  created_by_user_id INTEGER      REFERENCES users(id),
  notes              TEXT,
  created_at         DATETIME     DEFAULT NOW
)

order_items (
  id         INTEGER PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  unit_price FLOAT   DEFAULT 0
)
```

### Audit Logs
```sql
audit_logs (
  id            INTEGER PRIMARY KEY,
  org_id        INTEGER      REFERENCES organizations(id),
  user_id       INTEGER      REFERENCES users(id),
  action        VARCHAR(50)  NOT NULL,
  resource_type VARCHAR(50)  NOT NULL,
  resource_id   INTEGER,
  details       TEXT,
  created_at    DATETIME     DEFAULT NOW
)
```

### Refresh Tokens
```sql
refresh_tokens (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER      REFERENCES users(id),
  token_jti  VARCHAR(100) UNIQUE NOT NULL,
  expires_at DATETIME     NOT NULL,
  revoked    BOOLEAN      DEFAULT FALSE,
  created_at DATETIME     DEFAULT NOW
)
```

---

## API Design

### Base URL
`http://localhost:8000/api/v1`

### Authentication Endpoints

| Endpoint               | Method | Body                                                   | Response     |
|------------------------|--------|--------------------------------------------------------|--------------|
| `/auth/org/create`     | POST   | org_name, org_slug, admin_email, admin_full_name, admin_password | TokenPair |
| `/auth/login`          | POST   | org_slug, email, password                              | TokenPair    |
| `/auth/register`       | POST   | org_slug, email, full_name, password                   | UserOut      |
| `/auth/invite`         | POST   | email, full_name, password, role_name                  | UserOut      |
| `/auth/refresh`        | POST   | refresh_token                                          | TokenPair    |
| `/auth/logout`         | POST   | refresh_token                                          | 204          |

### Resource CRUD Pattern

Every resource follows: `GET /`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}`

All endpoints require Bearer token and scope-check. All queries are filtered by `org_id`.

### Request/Response Examples

**Create Organization**
```json
POST /auth/org/create
{
  "org_name": "Acme Inc",
  "org_slug": "acme-inc",
  "admin_email": "admin@acme.com",
  "admin_full_name": "John Doe",
  "admin_password": "SecurePass123"
}
→ { "access_token": "...", "refresh_token": "...", "token_type": "bearer" }
```

**Login**
```json
POST /auth/login
{
  "org_slug": "acme-inc",
  "email": "admin@acme.com",
  "password": "SecurePass123"
}
→ { "access_token": "...", "refresh_token": "...", "token_type": "bearer" }
```

**Stock Adjustment**
```json
POST /inventory/adjust
Authorization: Bearer <token>
{
  "product_id": 1,
  "warehouse_id": 1,
  "change": 50,
  "reason": "Initial stocking"
}
→ { "id": 1, "product_id": 1, "warehouse_id": 1, "quantity": 50, "updated_at": "..." }
```

---

## RBAC Permission Matrix

```
owner:  org:* users:* products:* orders:* warehouses:* inventory:* suppliers:* categories:* audit:read
admin:  users:cru products:* orders:* warehouses:* inventory:* suppliers:* categories:* audit:read
manager: products:cru orders:cru warehouses:cru inventory:rat suppliers:cru categories:cru
staff:  products:r orders:cr warehouses:r inventory:ra suppliers:r categories:r
```

Where: c=create, r=read, u=update, d=delete, a=adjust, t=transfer

---

## UI Design System

### Color Tokens (Light)
| Token         | Value                         |
|---------------|-------------------------------|
| `--surface`   | `#f0f4f8`                     |
| `--panel`     | `rgba(255,255,255,0.72)`      |
| `--accent`    | `#6366f1` (Indigo)            |
| `--danger`    | `#ef4444`                     |
| `--success`   | `#10b981`                     |
| `--warning`   | `#f59e0b`                     |

### Typography
- **Body**: Manrope (Google Fonts)
- **Monospace**: IBM Plex Mono

### Component Library
- Glass panels (`backdrop-filter: blur(16px)`)
- Gradient stat cards (5 color variants)
- Badge system (roles + statuses)
- Data tables with hover states
- Modal overlays with backdrop blur
- Toast notifications (success/error)
- Micro-animations (rise-in, fade, pulse-glow)
