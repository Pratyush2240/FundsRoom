# Mini ERP + CRM Operations Portal

A lightweight, full-stack Mini ERP and CRM Operations Portal built for wholesale and distribution businesses.

---

## 🏗️ Monorepo Structure

```text
/backend          - Node.js + Express + TypeScript + Prisma ORM + Zod + JWT API
/frontend         - React + Vite + TypeScript + Tailwind CSS Admin UI Shell
README.md         - Monorepo documentation & setup instructions
```

---

## 🛠️ Tech Stack Overview

### Backend
- **Node.js** & **Express.js** (REST API)
- **TypeScript**
- **Prisma ORM** & **PostgreSQL**
- **JWT** Authentication & **bcryptjs** password hashing
- **Zod** schema request validation

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS** (Admin Portal styling)
- **React Router**
- **Axios** (API HTTP Client)
- **Lucide React** (Iconography)

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js** (v18 or higher recommended, tested on v22.x)
- **NPM** (v9+ or v10+)
- **PostgreSQL** instance (Local or Supabase/Neon)

---

### Step 1: Backend Setup

```bash
cd backend
npm install
```

1. Create a `.env` file in `/backend` (or copy from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=super-secret-jwt-key-change-in-production
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_db?schema=public"
   ```

2. Start the Backend Development Server:
   ```bash
   npm run dev
   ```
   * The API server will start at `http://localhost:5000`
   * Health Check Endpoint: `http://localhost:5000/api/health`

---

### Step 2: Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

1. Create a `.env` file in `/frontend` (or copy from `.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

2. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```
   * The application shell will be accessible at `http://localhost:5173`

---

## 📡 API Endpoints (Current Implementation)

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/health` | Returns server health status, uptime, environment | ✅ Operational |
