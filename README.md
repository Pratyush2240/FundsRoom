# Fundsroom Mini ERP + CRM Operations Portal

A lightweight, production-ready Mini ERP and CRM Operations Portal built for wholesale and distribution business workflows.

---

## 1. Project Overview

The **Fundsroom Mini ERP + CRM Operations Portal** is a full-stack web application designed to streamline core wholesale operations:
- **Customer CRM**: Manage wholesale, distributor, and retail client profiles, contact history, and follow-ups.
- **Product & Stock Management**: Maintain product catalogs, pricing, warehouses, and low-stock threshold alerts.
- **Inventory Movements**: Track manual stock inflows (`IN`) and outbound dispatches (`OUT`) with audit logging.
- **Sales Challans**: Issue sales delivery challans with **atomic stock deduction** and automated snapshot pricing.
- **Role-Based Access Control (RBAC)**: Enforce granular role permissions for `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` personnel.

---

## 2. Architecture & Design Patterns

The portal follows a clean, modular architecture:

```text
[ React 18 + Vite Admin Shell ]
            │ (Axios API Client + JWT Interceptors)
            ▼
[ Node.js + Express REST API ]
            │ (Zod Validation -> Controller -> Service Layer)
            ▼
[ Prisma ORM + PostgreSQL Database ]
```

### Key Architectural Patterns:
- **Transactional Operations**: Sales challan creation and stock deduction execute inside a single Prisma database transaction (`$transaction`). If stock is insufficient or any step fails, the transaction rolls back completely.
- **Data Snapshotting**: `ChallanItem` stores historical snapshots of product name, SKU, and unit price to preserve audit accuracy even if catalog pricing changes later.
- **Optimistic Concurrency Control**: Stock deductions enforce non-negative stock invariants in PostgreSQL to prevent overselling.

---

## 3. Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs` password hashing
- **Validation**: Zod schema validation

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Lucide React icons
- **State & Routing**: React Router v6 & React Context API
- **HTTP Client**: Axios with automatic token refresh/401 interceptors

---

## 4. Repository Structure

```text
Fundsroom Case Study/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma database schema
│   │   └── seed.ts              # Development seed script
│   ├── src/
│   │   ├── config/              # Prisma client & env parser
│   │   ├── controllers/         # HTTP request handlers (auth, customer, product, inventory, challan)
│   │   ├── middleware/          # JWT authentication & RBAC authorization
│   │   ├── routes/              # Express API router endpoints
│   │   ├── services/            # Core business logic & database queries
│   │   ├── validations/         # Zod schemas for request payload validation
│   │   ├── app.ts               # Express application entry & error handling
│   │   └── server.ts            # Server port listener
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (ProtectedRoute, etc.)
│   │   ├── context/             # AuthContext session management
│   │   ├── pages/               # DashboardPage, CustomersPage, ProductsPage, InventoryPage, ChallansPage, LoginPage
│   │   ├── services/            # Axios API client instance
│   │   ├── types/               # TypeScript interfaces & enums
│   │   ├── App.tsx              # Router & layout shell
│   │   └── main.tsx             # React DOM root entry
│   └── package.json
└── README.md
```

---

## 5. Environment Variables Setup

### Backend Environment (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_URL="postgresql://postgres:password@localhost:5432/minierp_db?schema=public"
FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

### Frontend Environment (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 6. PostgreSQL & Prisma Setup

1. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Run Prisma Migrations** (creates database tables and constraints):
   ```bash
   npx prisma migrate dev
   ```

3. **Seed Development Data**:
   ```bash
   npx prisma db seed
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

---

## 7. Development Seed Credentials

> **Note**: These are seeded development credentials for local testing.

| Role | Email | Default Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@minierp.dev` | `Password@123` | Full access to all modules & actions |
| **SALES** | `rahul@minierp.dev` | `Password@123` | Customer CRM, Create Challans, View Products & Stock |
| **WAREHOUSE** | `priya@minierp.dev` | `Password@123` | Manage Products & Stock Movements, View Customers & Challans |
| **ACCOUNTS** | `amit@minierp.dev` | `Password@123` | Read-only access across all operational modules |

---

## 8. How to Run the Project

### Start Backend Server
```bash
cd backend
npm run dev
```
- Backend runs at `http://localhost:5000`.
- Health check available at `http://localhost:5000/api/health`.

### Start Frontend Portal
```bash
cd frontend
npm install
npm run dev
```
- Frontend portal runs at `http://localhost:5173`.

---

## 9. API Overview

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| **Health** | | | |
| `GET` | `/api/health` | Public | System status and database connectivity health |
| **Auth** | | | |
| `POST` | `/api/auth/login` | Public | Authenticates user; returns JWT token & role |
| `GET` | `/api/auth/me` | Bearer Token | Retrieves current logged-in user details |
| **Customers** | | | |
| `GET` | `/api/customers` | Authenticated | List customers with search, status, type filters & pagination |
| `GET` | `/api/customers/:id` | Authenticated | Get customer details by ID |
| `POST` | `/api/customers` | ADMIN, SALES | Create customer account |
| `PATCH` | `/api/customers/:id` | ADMIN, SALES | Update customer information |
| **Products** | | | |
| `GET` | `/api/products` | Authenticated | List products with search, category, low stock filter & pagination |
| `GET` | `/api/products/:id` | Authenticated | Get product detail by ID |
| `POST` | `/api/products` | ADMIN, WAREHOUSE | Add new product SKU |
| `PATCH` | `/api/products/:id` | ADMIN, WAREHOUSE | Update product details & stock thresholds |
| **Inventory** | | | |
| `GET` | `/api/inventory/movements` | Authenticated | List stock movements with filter by type (`IN`/`OUT`) & product |
| `POST` | `/api/inventory/movements` | ADMIN, WAREHOUSE | Record manual stock inflow (`IN`) or outflow (`OUT`) |
| **Challans** | | | |
| `GET` | `/api/challans` | Authenticated | List sales challans with customer filter, status filter & pagination |
| `GET` | `/api/challans/:id` | Authenticated | Get sales challan details, snapshot pricing & item line totals |
| `POST` | `/api/challans` | ADMIN, SALES | Create sales challan with **atomic stock deduction** |

---

## 10. RBAC Summary Matrix

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| **Dashboard** | Full | Full | Full | Full |
| **Customer CRM (Read)** | Yes | Yes | Yes | Yes |
| **Customer CRM (Create/Edit)** | Yes | Yes | No | No |
| **Products & Pricing (Read)** | Yes | Yes | Yes | Yes |
| **Products & Stock (Create/Edit)** | Yes | No | Yes | No |
| **Inventory Movements (Read)** | Yes | Yes | Yes | Yes |
| **Inventory Movements (Record IN/OUT)** | Yes | No | Yes | No |
| **Sales Challans (Read)** | Yes | Yes | Yes | Yes |
| **Sales Challans (Create & Deduct Stock)** | Yes | Yes | No | No |

---

## 11. Core Business Workflow

```text
[ Customer Lead / Active Profile ]
               │
               ▼
[ Catalog Product & Stock Configuration ]
               │
               ▼
[ Stock Inflow (IN Stock Movement) ]
               │
               ▼
[ Sales Delivery Challan Issue ] ──(Single Transaction)──► [ Stock Deduction (currentStock - quantity) ]
                                                        └─► [ OUT Stock Movement Audit Log ]
```

When a **Sales Challan** is created (`POST /api/challans`):
1. Validates customer and product existence.
2. Checks that requested quantities do not exceed available product stock.
3. Generates sequence challan number (`CH-YYYY-XXXX`).
4. Creates `Challan` and `ChallanItem` snapshot records.
5. Deducts item quantities directly from product stock (`currentStock`).
6. Creates corresponding `OUT` `StockMovement` audit records referencing the sales challan.
7. **If stock is insufficient for any item**, the entire transaction rolls back cleanly with a `400 Bad Request` error and stock remains untouched.

---

## 12. Verification & Build Commands

- **Backend Build & Typecheck**: `cd backend && npm run build`
- **Frontend Production Build**: `cd frontend && npm run build`
