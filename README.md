# Mini ERP + CRM Operations Portal

A lightweight, full-stack Mini ERP and CRM Operations Portal built for wholesale and distribution businesses.

---

## Monorepo Structure

```text
/backend          - Node.js + Express + TypeScript + Prisma ORM + Zod + JWT API
/frontend         - React + Vite + TypeScript + Tailwind CSS Admin UI Shell
README.md         - Monorepo documentation & setup instructions
```

---

## Tech Stack

### Backend
- **Node.js** & **Express.js** (REST API)
- **TypeScript**
- **Prisma ORM** & **PostgreSQL**
- **JWT** Authentication & **bcryptjs** password hashing
- **Zod** schema request validation

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS**
- **React Router** & **Axios**

---

## Local Setup

### Prerequisites
- **Node.js** v18+ (tested on v22.x)
- **npm** v9+
- **PostgreSQL** 14+ running locally (or a remote PostgreSQL connection string)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/minierp_db?schema=public"
```

---

### 2. Database Setup (Prisma + PostgreSQL)

**Run migrations** (creates the database and all tables):

```bash
cd backend
npx prisma migrate dev
```

**Seed development data** (users, customers, products, stock movements):

```bash
npx prisma db seed
```

**Regenerate Prisma Client** (needed if schema changes occur):

```bash
npx prisma generate
```

**Reset the database** (drops all data, re-runs migrations and seed):

```bash
npx prisma migrate reset
```

**Browse data visually** (opens Prisma Studio in browser):

```bash
npx prisma studio
```

---

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Database Schema

### Entity Relationship Overview

```text
User
├── StockMovement[]   (createdBy -> User)
└── Challan[]         (createdBy -> User)

Customer
└── Challan[]         (customerId -> Customer)

Product
├── StockMovement[]   (productId -> Product)
└── ChallanItem[]     (productId -> Product)

Challan
└── ChallanItem[]     (challanId -> Challan)
```

### Models

| Model | Table | Key Fields |
|---|---|---|
| User | `users` | id, name, email (unique), passwordHash, role |
| Customer | `customers` | id, name, mobile, businessName, customerType, status |
| Product | `products` | id, name, sku (unique), unitPrice, currentStock, minimumStock |
| StockMovement | `stock_movements` | id, productId, quantity, type (IN/OUT), reason, createdBy |
| Challan | `challans` | id, challanNumber (unique), customerId, status, createdBy |
| ChallanItem | `challan_items` | id, challanId, productId, snapshot fields, quantity |

### Enums

| Enum | Values |
|---|---|
| Role | ADMIN, SALES, WAREHOUSE, ACCOUNTS |
| CustomerType | RETAIL, WHOLESALE, DISTRIBUTOR |
| CustomerStatus | LEAD, ACTIVE, INACTIVE |
| MovementType | IN, OUT |
| ChallanStatus | DRAFT, CONFIRMED, CANCELLED |

### Delete and History Policy

All foreign keys use `onDelete: Restrict` (except ChallanItem -> Challan which uses Cascade). This prevents accidental deletion of historical business records. Application-level deactivation or archiving is preferred over destructive deletion.

---

## Development Seed Credentials

> **WARNING:** DEVELOPMENT ONLY — Do NOT use these credentials in production environments.

| Role | Email | Password |
|---|---|---|
| Admin | admin@minierp.dev | Password@123 |
| Sales | rahul@minierp.dev | Password@123 |
| Warehouse | priya@minierp.dev | Password@123 |
| Accounts | amit@minierp.dev | Password@123 |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health and database connectivity status |
