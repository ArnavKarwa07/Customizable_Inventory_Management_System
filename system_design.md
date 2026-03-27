# System Design Document - Customizable Inventory Management System

## Executive Summary

The Customizable Inventory Management System is designed as a full-stack web application using modern, scalable technologies. This document provides detailed system design specifications including database schemas, API endpoints, UI/UX design principles, and implementation guidelines.

---

## 1. Database Schema Design

### 1.1 Physical Database Schema

#### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    profile_picture_url TEXT,
    role_id INTEGER NOT NULL,
    warehouse_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
```

#### Roles Table

```sql
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permission structure in JSON:
-- {
--   "inventory": ["read", "write", "delete"],
--   "products": ["read", "write", "delete"],
--   "reports": ["read"],
--   "settings": ["read", "write"],
--   "users": ["read", "write"]
-- }
```

#### Warehouses Table

```sql
CREATE TABLE warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    address TEXT NOT NULL,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    capacity REAL,
    current_utilization REAL DEFAULT 0,
    manager_id INTEGER,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);
```

#### Products Table

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sub_category TEXT,
    unit_of_measure TEXT DEFAULT 'Units',
    cost_price REAL NOT NULL,
    selling_price REAL NOT NULL,
    min_reorder_level INTEGER NOT NULL,
    max_stock_level INTEGER,
    lead_time_days INTEGER DEFAULT 7,
    barcode TEXT UNIQUE,
    image_url TEXT,
    weight REAL,
    dimensions TEXT,
    attributes JSON,
    is_active BOOLEAN DEFAULT 1,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
```

#### Inventory Table

```sql
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_damaged INTEGER NOT NULL DEFAULT 0,
    quantity_expired INTEGER NOT NULL DEFAULT 0,
    reorder_quantity INTEGER,
    last_counted_at DATETIME,
    next_count_due DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    UNIQUE(product_id, warehouse_id)
);
CREATE INDEX idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
```

#### Stock Movements Table

```sql
CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,  -- 'IN', 'OUT', 'ADJUSTMENT', 'TRANSFER', 'DAMAGE', 'EXPIRED'
    quantity INTEGER NOT NULL,
    reference_type TEXT,  -- 'ORDER', 'RETURN', 'TRANSFER', 'CYCLE_COUNT'
    reference_id INTEGER,
    from_warehouse_id INTEGER,
    to_warehouse_id INTEGER,
    reason TEXT,
    performed_by INTEGER NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);
CREATE INDEX idx_stock_movements_inventory ON stock_movements(inventory_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
```

#### Orders Table

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT NOT NULL,  -- 'PURCHASE', 'SALES'
    supplier_id INTEGER,
    customer_id INTEGER,
    warehouse_id INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING',  -- 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATETIME,
    actual_delivery_date DATETIME,
    total_amount REAL,
    total_items INTEGER,
    notes TEXT,
    attachments JSON,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    accepted_quantity INTEGER DEFAULT 0,
    rejected_quantity INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### Suppliers Table

```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    alternative_phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    tax_id TEXT,
    bank_details JSON,
    lead_time_days INTEGER DEFAULT 7,
    payment_terms TEXT,
    rating REAL DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
```

#### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity_type TEXT NOT NULL,  -- 'PRODUCT', 'INVENTORY', 'ORDER'
    entity_id INTEGER,
    old_values JSON,
    new_values JSON,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT DEFAULT 'SUCCESS',  -- 'SUCCESS', 'FAILURE'
    error_message TEXT,
    details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 2. API Endpoint Specifications

### 2.1 Authentication Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me              (Current user)
```

### 2.2 User Management Endpoints

```
GET    /api/v1/users                (List all users - Admin)
GET    /api/v1/users/{id}           (Get user details)
POST   /api/v1/users                (Create new user - Admin)
PUT    /api/v1/users/{id}           (Update user)
DELETE /api/v1/users/{id}           (Soft delete user - Admin)
PUT    /api/v1/users/{id}/password  (Change password)
PUT    /api/v1/users/{id}/profile   (Update profile)
GET    /api/v1/users/{id}/activity  (User activity log)
```

### 2.3 Inventory Management Endpoints

```
GET    /api/v1/inventory                          (List inventory with filters)
GET    /api/v1/inventory/{id}                     (Get inventory details)
GET    /api/v1/inventory/product/{product_id}    (Get inventory by product)
PUT    /api/v1/inventory/{id}                     (Update inventory)
POST   /api/v1/inventory/adjust-stock             (Adjust stock)
POST   /api/v1/inventory/transfer                 (Transfer stock between warehouses)
POST   /api/v1/inventory/cycle-count              (Initiate cycle count)
GET    /api/v1/inventory/low-stock                (Get low stock products)
GET    /api/v1/inventory/movement-history/{id}   (Get movement history)
```

### 2.4 Product Management Endpoints

```
GET    /api/v1/products                  (List products with filters)
GET    /api/v1/products/{id}             (Get product details)
POST   /api/v1/products                  (Create new product)
PUT    /api/v1/products/{id}             (Update product)
DELETE /api/v1/products/{id}             (Soft delete product)
GET    /api/v1/products/sku/{sku}        (Get by SKU)
POST   /api/v1/products/bulk-import      (Import products from CSV)
GET    /api/v1/products/export           (Export products)
GET    /api/v1/products/{id}/movements   (Get product movement history)
```

### 2.5 Warehouse Management Endpoints

```
GET    /api/v1/warehouses               (List all warehouses)
GET    /api/v1/warehouses/{id}          (Get warehouse details)
POST   /api/v1/warehouses               (Create warehouse - Admin)
PUT    /api/v1/warehouses/{id}          (Update warehouse)
DELETE /api/v1/warehouses/{id}          (Delete warehouse - Admin)
GET    /api/v1/warehouses/{id}/metrics  (Get warehouse metrics)
```

### 2.6 Order Management Endpoints

```
GET    /api/v1/orders                   (List orders with filters)
GET    /api/v1/orders/{id}              (Get order details)
POST   /api/v1/orders                   (Create new order)
PUT    /api/v1/orders/{id}              (Update order)
PATCH  /api/v1/orders/{id}/status       (Update order status)
DELETE /api/v1/orders/{id}              (Cancel order)
POST   /api/v1/orders/{id}/receive      (Receive order items)
GET    /api/v1/orders/export            (Export orders)
```

### 2.7 Supplier Management Endpoints

```
GET    /api/v1/suppliers                (List suppliers)
GET    /api/v1/suppliers/{id}           (Get supplier details)
POST   /api/v1/suppliers                (Create supplier)
PUT    /api/v1/suppliers/{id}           (Update supplier)
DELETE /api/v1/suppliers/{id}           (Soft delete supplier)
GET    /api/v1/suppliers/{id}/orders    (Get supplier orders)
```

### 2.8 Reports & Analytics Endpoints

```
GET    /api/v1/reports/dashboard        (Dashboard KPIs)
GET    /api/v1/reports/inventory-status (Inventory health)
GET    /api/v1/reports/top-products     (Top selling products)
GET    /api/v1/reports/warehouse-util   (Warehouse utilization)
GET    /api/v1/reports/movement-report  (Stock movement report)
GET    /api/v1/reports/order-status     (Order status report)
POST   /api/v1/reports/generate         (Generate custom report)
```

### 2.9 Settings Endpoints

```
GET    /api/v1/settings                 (Get system settings)
PUT    /api/v1/settings                 (Update settings - Admin)
GET    /api/v1/roles                    (List roles - Admin)
POST   /api/v1/roles                    (Create role - Admin)
PUT    /api/v1/roles/{id}               (Update role - Admin)
```

---

## 3. UI/UX Design System

### 3.1 Design Principles

#### Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Semantic HTML structure

#### Responsiveness

- Mobile-first approach
- Desktop: 1920px+
- Tablet: 768px - 1024px
- Mobile: 375px - 768px

#### Performance

- Fast interaction feedback
- Optimized images
- Code splitting
- Lazy loading for lists
- Smooth animations (<300ms)

#### Visual Hierarchy

- Clear typography scale
- Consistent spacing grid (4px base)
- Color psychology
- Icon usage guidelines

### 3.2 Color Palette

```
Primary Colors:
- Primary: #2563EB (Blue)
- Primary-light: #DBEAFE
- Primary-dark: #1E40AF

Secondary Colors:
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Sky)

Neutral Colors:
- Gray-50: #F9FAFB
- Gray-100: #F3F4F6
- Gray-200: #E5E7EB
- Gray-500: #6B7280
- Gray-900: #111827

Dark Mode:
- Background: #0F172A
- Surface: #1E293B
- Surface-alt: #334155
- Text: #F1F5F9
```

### 3.3 Typography

```
Heading 1: 32px, Weight 700
Heading 2: 28px, Weight 700
Heading 3: 24px, Weight 600
Heading 4: 20px, Weight 600
Body: 16px, Weight 400
Body-small: 14px, Weight 400
Caption: 12px, Weight 500

Font Family: 'Inter' or system fonts
Line Height: 1.5 (paragraphs), 1.2 (headings)
```

### 3.4 Component Library (Shadcn/UI)

Key Components:

- Button (primary, secondary, outline, ghost)
- Input (text, email, number, password)
- Select (dropdown)
- Checkbox & Radio
- Modal/Dialog
- Toast/Alert
- Card
- Table
- Sidebar
- Tabs
- Breadcrumb
- Badge
- Progress
- Skeleton (loading state)

### 3.5 Page Layouts

#### Login/Register Pages

```
┌─────────────────────────────────────┐
│                                     │
│  Logo | Company Name                │
│                                     │
│  Form (Email, Password, etc.)       │
│  Sign In / Create Account button    │
│                                     │
│  Footer links                       │
└─────────────────────────────────────┘
```

#### Dashboard Page

```
┌──────────────────────────────────────────────────┐
│ Logo  Navigation     User Menu                   │
├──────────────────────────────────────────────────┤
│ Sidebar │ Breadcrumb                             │
├─────────┤ ──────────────────────────────────────┤
│         │ Title + Actions                        │
│ Nav     │ ──────────────────────────────────────┤
│ Items   │ KPI Cards Grid    (4 columns)         │
│         │ ──────────────────────────────────────┤
│         │ Charts (2 columns)                     │
│         │ ──────────────────────────────────────┤
│         │ Recent Activity Table                 │
└─────────┴──────────────────────────────────────┘
```

#### Data Management Pages (Products, Inventory, Orders)

```
┌──────────────────────────────────────────────────┐
│ Logo  Navigation     User Menu                   │
├──────────────────────────────────────────────────┤
│ Sidebar │ Breadcrumb                             │
├─────────┤ ──────────────────────────────────────┤
│         │ Title + Create Button + Export        │
│ Nav     │ ──────────────────────────────────────┤
│ Items   │ Filters & Search                      │
│         │ ──────────────────────────────────────┤
│         │ Data Table                            │
│         │ ──────────────────────────────────────┤
│         │ Pagination                            │
└─────────┴──────────────────────────────────────┘
```

### 3.6 Interactive States

```
Button States:
- Default: Base color
- Hover: Darker shade
- Active: Even darker with shadow
- Disabled: Gray with opacity

Input States:
- Default: Gray border
- Focused: Blue border + shadow
- Error: Red border
- Disabled: Gray background

Table Row States:
- Default: White background
- Hover: Light gray background
- Selected: Light blue background
```

### 3.7 Animations & Transitions

```
Page Transitions: 200ms ease-in-out
Modal Entry: 300ms ease-out
Button Hover: 150ms ease-out
Load Skeleton: Pulse effect
Toast Slide-in: 300ms ease-out
```

### 3.8 Responsive Breakpoints

```
Mobile (375px - 767px):
- Single column layout
- Sidebar → Drawer/Bottom sheet
- Compressed tables → Card view
- Stacked forms

Tablet (768px - 1023px):
- Two column layouts
- Sidebar visible but narrow
- Full tables possible
- Side-by-side cards

Desktop (1024px+):
- Full layouts
- Multi-column grids
- All features visible
- Optimal information density
```

---

## 4. Implementation Guidelines

### 4.1 Frontend Implementation

#### Project Structure

```
Frontend follows Next.js 14 App Router conventions
- TypeScript throughout
- Centralized state management (Zustand)
- Custom hooks for reusable logic
- Atomic component design
- Strict TypeScript linting
```

#### Key Features

1. **Authentication**
   - JWT stored in HTTP-only cookies
   - Automatic token refresh
   - Protected routes via middleware
   - Session persistence

2. **Data Management**
   - React Query for server state
   - Zustand for client state
   - Form state via React Hook Form
   - Optimistic updates

3. **Performance**
   - Image optimization
   - Code splitting
   - Lazy loading routes
   - Service worker for offline

4. **Accessibility**
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation
   - Focus management

### 4.2 Backend Implementation

#### Project Structure

```
Backend follows FastAPI best practices
- Python 3.11+ type hints
- Async/await throughout
- SQLAlchemy async ORM
- Pydantic v2 for validation
- Structured logging
```

#### Key Features

1. **Authentication & Authorization**
   - JWT-based auth
   - Role-based access control
   - Permission decorators
   - Audit logging

2. **Data Validation**
   - Pydantic schemas
   - Custom validators
   - Business logic validation
   - Error handling

3. **Database Operations**
   - Async SQLAlchemy
   - Transaction management
   - Query optimization
   - Migration versioning

4. **API Best Practices**
   - RESTful design
   - Standardized responses
   - Comprehensive error handling
   - Request logging

### 4.3 Database Implementation

#### Migrations

- Alembic for schema versioning
- Reversible migrations
- Data migration support

#### Queries

- SQLAlchemy ORM with async
- Query optimization
- Index usage
- Connection pooling

---

## 5. Testing Strategy

### Frontend Testing

- Unit tests: Jest + React Testing Library
- Component tests: Critical UI components
- E2E tests: Key user workflows with Playwright
- Coverage target: >80%

### Backend Testing

- Unit tests: pytest for business logic
- Integration tests: Full API endpoints
- Database tests: Schema and data operations
- Coverage target: >85%

### Test Categories

1. **Functionality**: Feature works as specified
2. **Integration**: Components work together
3. **Performance**: API <200ms response time
4. **Security**: Auth, validation, injection prevention
5. **Accessibility**: WCAG compliance

---

## 6. Performance Targets

### API Performance

- Authentication: <300ms
- Data retrieval: <500ms
- Bulk operations: <2s
- Page load time: <3s
- Time to interactive: <2.5s

### Database Performance

- Single row query: <10ms
- List query (100 items): <50ms
- Batch operations: <500ms
- Index utilization: >95%

### Frontend Performance

- First Paint: <2s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- Time to Interactive: <2.5s

---

## 7. Security Specifications

### Authentication

- Bcrypt password hashing (10+ rounds)
- JWT expiration: 24 hours
- Refresh token rotation
- Rate limiting: 5 attempts per 15min

### Authorization

- Role-based access control
- Permission inheritance
- Field-level security
- Resource ownership validation

### Data Protection

- HTTPS only
- SQL injection prevention (ORM)
- XSS prevention (React escaping)
- CSRF tokens for state-changing operations

### Audit & Compliance

- All actions logged
- 90-day audit retention
- User activity tracking
- IP logging

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Ready for Implementation
