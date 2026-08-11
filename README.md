# Fundsroom Mini ERP + CRM Operations Portal

A lightweight, production-ready B2B Wholesale & Distribution Mini ERP and CRM Operations Portal built with Node.js, Express, PostgreSQL, Prisma, React, and TypeScript. Styled using a restrained enterprise design system (Warm Gray & Charcoal).

---

## 1. Project Overview

The **Fundsroom Mini ERP + CRM Operations Portal** is an end-to-end operations management system designed for B2B wholesale and distribution workflows:
- **Operations Dashboard**: Live operational metrics, low-stock alerts, recent sales challan dispatches, recent inventory activity, and system health status.
- **Customer CRM**: Manage wholesale, distributor, and retail customer profiles, GST numbers, contact history, and follow-ups.
- **Product & Stock Management**: Maintain catalog SKUs, unit pricing, warehouse locations, and minimum stock threshold alerts.
- **Inventory Movements**: Log manual stock inflows (`IN`) and outbound adjustments (`OUT`) with complete audit trails.
- **Sales Delivery Challans**: Issue sales challans with **atomic stock deduction** and snapshot pricing inside PostgreSQL transactions.
- **Role-Based Access Control (RBAC)**: Enforce granular permissions across `ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS` user roles.
- **Enterprise Design System**: Restrained B2B palette (`#F7F7F5` background, `#FFFFFF` cards, `#252525` text, `#2F3437` primary actions, `#E9ECEB` active navigation, and muted status indicators).

---

## 2. Key Architecture & Design Patterns

```text
[ React 18 + Vite Admin Portal Shell ]
            │ (Axios REST API Client + JWT Interceptors)
            ▼
[ Node.js + Express REST API ]
            │ (Zod Validation -> Controller -> Service Layer)
            ▼
[ Prisma ORM + PostgreSQL Database ]
```

### Architectural Highlights:
- **Transactional Atomic Fulfillment**: Sales challan creation and inventory stock deduction execute inside a single Prisma database transaction (`$transaction`). If stock is insufficient or any line item fails, the transaction rolls back completely.
- **Audit Price Snapshotting**: `ChallanItem` stores immutable snapshots of product name, SKU, and unit price at the exact moment of issuance to guarantee historical accuracy regardless of future catalog changes.
- **Concurrency & Stock Integrity**: Non-negative stock invariants in PostgreSQL ensure stock cannot drop below zero during concurrent dispatches.
- **Enterprise UI System**: Clean, dense, and functional layout inspired by enterprise ERP interfaces with zero unnecessary animations, neon gradients, or dark-blue glare.

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
- **HTTP Client**: Axios with automatic token authorization & 401 interceptors

---

## 4. Repository Structure

```text
Fundsroom Case Study/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma database schema & relations
│   │   └── seed.ts              # Seed script for initial operational data
│   ├── src/
│   │   ├── config/              # Prisma client instance & env parser
│   │   ├── controllers/         # Request handlers (auth, customer, product, inventory, challan, health)
│   │   ├── middleware/          # JWT authentication & RBAC authorization
│   │   ├── routes/              # Express API routers
│   │   ├── services/            # Business logic & database operations
│   │   ├── validations/         # Zod schemas for query/body validation
│   │   ├── app.ts               # Express middleware setup & error handlers
│   │   └── server.ts            # Server port listener entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Protected routes & layout shells
│   │   ├── context/             # AuthContext session management
│   │   ├── pages/               # DashboardPage, CustomersPage, ProductsPage, InventoryPage, ChallansPage, LoginPage
│   │   ├── services/            # Axios API service instance
│   │   ├── types/               # TypeScript models & response types
│   │   ├── App.tsx              # Application layout & routing matrix
│   │   ├── index.css            # Base Tailwind CSS tokens
│   │   └── main.tsx             # React DOM root entry
│   └── package.json
└── README.md
```

---

## 5. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_URL="postgresql://postgres:password@localhost:5432/minierp_db?schema=public"
FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 6. Setup & Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Seed Initial Development Data**:
   ```bash
   npx prisma db seed
   ```

4. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 7. Development Credentials

The login page includes a built-in **Demo Access** selector for easy role testing:

| Role | Email | Password | Allowed Module Access |
|---|---|---|---|
| **ADMIN** | `admin@minierp.dev` | `Password@123` | Full system access across all modules |
| **SALES** | `rahul@minierp.dev` | `Password@123` | Customer CRM, Create Challans, View Products & Inventory |
| **WAREHOUSE** | `priya@minierp.dev` | `Password@123` | Manage Products & Stock Movements, View Customers & Challans |
| **ACCOUNTS** | `amit@minierp.dev` | `Password@123` | Read-only access across all operational modules |

---

## 8. Running the Application

### Start Backend Server:
```bash
cd backend
npm run dev
```
*API running at `http://localhost:5000/api`*

### Start Frontend Portal:
```bash
cd frontend
npm run dev
```
*Portal running at `http://localhost:5173`*

---

## 9. API Reference

| Category | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public | System uptime & database connection status |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user credentials & receive JWT token |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Retrieve profile details of authenticated user |
| **Customers** | `GET` | `/api/customers` | Authenticated | List customer accounts with search & pagination (max 50) |
| **Customers** | `GET` | `/api/customers/:id` | Authenticated | Get detailed customer record |
| **Customers** | `POST` | `/api/customers` | ADMIN, SALES | Create new customer profile |
| **Customers** | `PATCH` | `/api/customers/:id` | ADMIN, SALES | Update customer contact & pipeline status |
| **Products** | `GET` | `/api/products` | Authenticated | List products with search, category & low stock filter (max 50) |
| **Products** | `GET` | `/api/products/:id` | Authenticated | Get product SKU details |
| **Products** | `POST` | `/api/products` | ADMIN, WAREHOUSE | Register new catalog SKU |
| **Products** | `PATCH` | `/api/products/:id` | ADMIN, WAREHOUSE | Update product details & stock thresholds |
| **Inventory** | `GET` | `/api/inventory/movements` | Authenticated | Audit log of stock movements (`IN` / `OUT`) |
| **Inventory** | `POST` | `/api/inventory/movements` | ADMIN, WAREHOUSE | Record manual stock inflow or outflow |
| **Challans** | `GET` | `/api/challans` | Authenticated | List delivery challans with customer & status filters |
| **Challans** | `GET` | `/api/challans/:id` | Authenticated | Get challan detail & itemized pricing snapshots |
| **Challans** | `POST` | `/api/challans` | ADMIN, SALES | Issue sales challan with **atomic stock deduction** |

---

## 10. RBAC Matrix

| Feature / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
|---|:---:|:---:|:---:|:---:|
| **Operations Dashboard** | View | View | View | View |
| **Customer CRM** | Create / Edit | Create / Edit | Read-Only | Read-Only |
| **Products & Stock** | Create / Edit | Read-Only | Create / Edit | Read-Only |
| **Inventory Adjustments** | Record IN/OUT | Read-Only | Record IN/OUT | Read-Only |
| **Sales Delivery Challans** | Create / Issue | Create / Issue | Read-Only | Read-Only |

---

## 11. Build & Type Verification

```bash
# Frontend Typecheck & Build
cd frontend
npx tsc --noEmit
npm run build

# Backend Typecheck & Build
cd backend
npm run build
```
