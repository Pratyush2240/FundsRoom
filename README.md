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
FRONTEND_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
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

**Regenerate Prisma Client**:

```bash
npx prisma generate
```

---

### 3. Start Servers

**Backend**:
```bash
cd backend
npm run dev
```
Runs at `http://localhost:5000`. Health check: `GET /api/health`.

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

---

## Database Schema

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

| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server health and database connectivity status |
| `POST` | `/api/auth/login` | Public | User authentication; returns JWT token & profile |
| `GET` | `/api/auth/me` | Bearer Token | Retrieves current authenticated user details |

Authentication is implemented. Reusable backend RBAC middleware is available and will be applied to protected business endpoints as Customer, Inventory, and Challan modules are added; those business APIs do not exist yet.
