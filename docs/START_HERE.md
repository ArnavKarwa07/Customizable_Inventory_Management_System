# Getting Started — StockPilot IMS v2.0

Welcome! This guide will get you up and running with StockPilot in under 5 minutes.

---

## Prerequisites

- **Python 3.11+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

---

## Step 1: Clone & Setup Backend

```bash
git clone <repo-url>
cd Customizable_Inventory_Management_System/backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

The server will:
1. Create `inventory.db` automatically
2. Seed the four roles (owner, admin, manager, staff)
3. Start serving at `http://localhost:8000`

Verify: Open `http://localhost:8000/docs` to see the Swagger API docs.

---

## Step 2: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Step 3: Create Your Organization

1. Navigate to `http://localhost:3000/register`
2. Enter your **Organization Name** (e.g., "Acme Inc")
3. Enter a **Slug** (e.g., "acme-inc") — this is the URL-friendly ID
4. Fill in your admin name, email, and password
5. Click **Create Organization & Sign In**

You're now logged in as the **owner** of your organization!

---

## Step 4: Explore the Platform

### Add a Warehouse
Go to **Warehouses** → Fill in name and code → **Create Warehouse**

### Add a Product
Go to **Products** → Fill in SKU, name, and price → **Create Product**

### Adjust Stock
Go to **Inventory** → Use the **Stock Adjustment** form → Pick product and warehouse → Set quantity

### Create an Order
Go to **Orders** → Select warehouse and product → Set quantity → **Create Order**

### Invite a Team Member
Go to **Settings** → **Invite User** → Fill in details and select a role → **Invite**

---

## Key URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Frontend app |
| `http://localhost:8000/docs` | Swagger API documentation |
| `http://localhost:8000/redoc` | ReDoc API documentation |

---

## Architecture Overview

```
Frontend (Next.js)  →  Backend (FastAPI)  →  Database (SQLite)
   Port 3000              Port 8000           inventory.db
```

- **Auth**: JWT tokens stored in localStorage + cookies
- **RBAC**: 4 roles (owner > admin > manager > staff) with scope-based checks
- **Multi-tenancy**: All data isolated by organization via `org_id`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check Python version: `python --version` (needs 3.11+) |
| Frontend 401 errors | Clear browser localStorage and re-login |
| CORS errors | Ensure backend has `CORS_ORIGINS=http://localhost:3000` in `.env` |
| Login fails | Make sure you're entering the correct org slug |

---

## Next Steps

- Read the [README.md](../README.md) for full API reference
- Check [architecture.md](./architecture.md) for system design details
- See [SRS.md](./SRS.md) for all requirements
- Review [tech_stack.md](./tech_stack.md) for technology decisions

---

**Happy building!** 🚀
