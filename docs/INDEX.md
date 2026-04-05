# Documentation Index — StockPilot IMS v2.0

All project documentation for the StockPilot Inventory Management System.

---

## 📚 Documents

### Core Documentation

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview, quick start, API reference |
| [SRS.md](./SRS.md) | Software Requirements Specification — all functional and non-functional requirements |
| [architecture.md](./architecture.md) | System architecture — multi-tenancy, RBAC, audit, frontend/backend layers |
| [system_design.md](./system_design.md) | Detailed database schemas, API endpoint specs, RBAC matrix, UI design tokens |
| [tech_stack.md](./tech_stack.md) | Technology choices, rationale, and environment variables |

### Process Documentation

| Document | Description |
|----------|-------------|
| [AGILE.md](./AGILE.md) | Agile process, sprint structure, team roles |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guides for production environments |

### Summary Documents

| Document | Description |
|----------|-------------|
| [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) | High-level project summary for stakeholders |
| [PROJECT_DELIVERY_SUMMARY.md](./PROJECT_DELIVERY_SUMMARY.md) | Delivery status and completion tracking |
| [PRODUCT_READY.md](./PRODUCT_READY.md) | Production readiness checklist |
| [START_HERE.md](./START_HERE.md) | Getting started guide for new developers |

---

## 🔑 Key Concepts

### Multi-Tenancy
Every piece of data belongs to an **Organization**. Users log in with their org slug. Queries are always filtered by `org_id`.

### RBAC Hierarchy
`owner` → `admin` → `manager` → `staff`

Each role has a defined set of **scopes** (e.g., `products:delete`, `inventory:transfer`). Higher roles inherit all lower permissions.

### Audit Trail
Every create, update, and delete action is logged to `audit_logs` with user ID, action type, resource, and timestamp.

---

**Version**: 2.0.0 | **Updated**: April 2026
