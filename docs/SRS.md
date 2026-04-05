# Software Requirements Specification — StockPilot IMS v2.0

## 1. Introduction

### 1.1 Purpose
This document defines the software requirements for StockPilot, a multi-tenant inventory management system designed for retail businesses, warehouses, and e-commerce platforms.

### 1.2 Scope
StockPilot provides organization-based workspaces, role-based access control, product catalog management, multi-warehouse inventory tracking, order management, supplier and category management, and a comprehensive audit trail.

### 1.3 Intended Users
- **Organization Owners** — Company administrators who create and manage their workspace
- **Administrators** — Users who manage team members and all operational data
- **Managers** — Users who manage products, orders, and stock
- **Staff** — Users who view data, create orders, and perform stock adjustments

---

## 2. Functional Requirements

### 2.1 Organization Management

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| ORG-01 | Users can create a new organization with a unique slug         | Must     |
| ORG-02 | Organization owner account is created during org setup         | Must     |
| ORG-03 | Owners can update the organization name                        | Should   |
| ORG-04 | All data is isolated by organization                           | Must     |
| ORG-05 | Organization slug is used for login identification             | Must     |

### 2.2 Authentication & Authorization

| ID      | Requirement                                                  | Priority |
|---------|--------------------------------------------------------------|----------|
| AUTH-01 | Login requires org_slug + email + password                    | Must     |
| AUTH-02 | JWT access tokens expire after 24 hours                       | Must     |
| AUTH-03 | JWT refresh tokens expire after 7 days with rotation          | Must     |
| AUTH-04 | Self-registration creates a staff-level account               | Should   |
| AUTH-05 | Owners/admins can invite users with specified roles            | Must     |
| AUTH-06 | Users cannot assign roles higher than their own               | Must     |
| AUTH-07 | Logout revokes the refresh token                              | Must     |

### 2.3 Role-Based Access Control

| ID      | Requirement                                                  | Priority |
|---------|--------------------------------------------------------------|----------|
| RBAC-01 | Four role tiers: owner, admin, manager, staff                 | Must     |
| RBAC-02 | Each role has a defined set of permission scopes               | Must     |
| RBAC-03 | API endpoints enforce scope-based access checks                | Must     |
| RBAC-04 | UI elements are conditionally rendered based on scopes         | Should   |
| RBAC-05 | Delete operations restricted to owner and admin roles          | Must     |

### 2.4 Product Management

| ID      | Requirement                                                  | Priority |
|---------|--------------------------------------------------------------|----------|
| PROD-01 | Products have SKU, name, description, unit price              | Must     |
| PROD-02 | Products belong to optional category and supplier              | Should   |
| PROD-03 | Products have configurable low stock thresholds                | Must     |
| PROD-04 | Full CRUD: create, read, update, delete                        | Must     |
| PROD-05 | Products can be searched by name or SKU                        | Should   |
| PROD-06 | Products can be activated/deactivated                          | Should   |

### 2.5 Inventory Tracking

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| INV-01 | View stock levels across all product-warehouse combinations    | Must     |
| INV-02 | Adjust stock with positive/negative changes and reason         | Must     |
| INV-03 | Transfer stock between warehouses                              | Must     |
| INV-04 | Stock cannot be adjusted below zero                            | Must     |
| INV-05 | All movements are recorded with reason and user                | Must     |
| INV-06 | Low stock alerts based on product thresholds                   | Must     |
| INV-07 | View stock movement history                                    | Should   |

### 2.6 Order Management

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| ORD-01 | Orders have auto-generated order numbers                       | Must     |
| ORD-02 | Orders track status: draft → pending → completed/cancelled     | Must     |
| ORD-03 | Orders contain line items with products and quantities          | Must     |
| ORD-04 | Only draft orders can be deleted                               | Must     |
| ORD-05 | Order items store unit price at time of creation                | Should   |

### 2.7 Warehouse Management

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| WH-01  | Warehouses have name, code, and optional address               | Must     |
| WH-02  | Warehouses can be activated/deactivated                        | Should   |
| WH-03  | Warehouses cannot be deleted if they have active inventory      | Must     |
| WH-04  | Full CRUD for warehouses                                       | Must     |

### 2.8 Supplier Management

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| SUP-01 | Suppliers have name, email, phone, and address                 | Must     |
| SUP-02 | Suppliers can be linked to products                            | Should   |
| SUP-03 | Full CRUD for suppliers                                        | Must     |

### 2.9 Category Management

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| CAT-01 | Categories have a name and optional description                | Must     |
| CAT-02 | Categories can be linked to products                           | Should   |
| CAT-03 | Category names must be unique within an organization           | Must     |
| CAT-04 | Full CRUD for categories                                       | Must     |

### 2.10 Audit Trail

| ID     | Requirement                                                   | Priority |
|--------|---------------------------------------------------------------|----------|
| AUD-01 | All create, update, and delete actions are logged              | Must     |
| AUD-02 | Audit entries include user, action, resource, and timestamp    | Must     |
| AUD-03 | Audit log is filterable by resource type                       | Should   |
| AUD-04 | Only admins and owners can view the audit log                  | Must     |

### 2.11 Dashboard

| ID      | Requirement                                                  | Priority |
|---------|--------------------------------------------------------------|----------|
| DASH-01 | Display total products, orders, warehouses, suppliers          | Must     |
| DASH-02 | Display low stock alerts                                       | Must     |
| DASH-03 | Display recent audit activity (admin/owner)                    | Should   |

---

## 3. Non-Functional Requirements

| Category       | Requirement                                              |
|----------------|----------------------------------------------------------|
| Performance    | API response < 500ms (95th percentile)                   |
| Security       | All passwords hashed with bcrypt                         |
| Security       | JWT tokens with rotation and revocation                  |
| Security       | SQL injection prevention via ORM                         |
| Usability      | Responsive design (mobile, tablet, desktop)              |
| Usability      | Dark/Light theme support                                 |
| Maintainability| Type-safe codebase (TypeScript + Python type hints)      |
| Scalability    | PostgreSQL migration path available                      |
| Availability   | Auto-creates database on first run                       |

---

## 4. Constraints

- SQLite is the default database (single-writer limitation)
- No real-time WebSocket updates (pull-based refresh)
- No email verification for self-registration
- No password reset flow (admin can re-invite)
