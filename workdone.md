# Stage 2 Work Completed: Database Design, Prisma, Migrations, and Seed Data

## Overview

Stage 2 established the core relational database layer for the Mini ERP + CRM Operations Portal using PostgreSQL and Prisma ORM. The architecture follows enterprise data modeling practices, preserving business history, enforcing strict foreign key constraints, and supporting key ERP/CRM workflows.

---

## 1. Relational Schema & Models

Six core models and five enums were designed and implemented in `backend/prisma/schema.prisma`:

### Models

1. **User (`users`)**
   - Fields: `id` (UUID), `name`, `email` (unique), `passwordHash`, `role`, `createdAt`, `updatedAt`
   - Role Enum: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
   - Direct password storage strictly prohibited; stores only bcrypt hashes.

2. **Customer (`customers`)**
   - Fields: `id` (UUID), `name`, `mobile`, `email` (optional), `businessName`, `gstNumber` (optional), `customerType`, `address`, `status`, `followUpDate` (optional), `notes` (optional), `createdAt`, `updatedAt`
   - CustomerType Enum: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR`
   - CustomerStatus Enum: `LEAD`, `ACTIVE`, `INACTIVE`
   - Indexed for search optimization on `name`, `mobile`, `businessName`, `status`, and `customerType`.

3. **Product (`products`)**
   - Fields: `id` (UUID), `name`, `sku` (unique), `category`, `unitPrice` (Decimal 12,2), `currentStock` (Integer), `minimumStock` (Integer), `warehouse`, `createdAt`, `updatedAt`
   - Indexed on `sku`, `category`, and `warehouse`.

4. **StockMovement (`stock_movements`)**
   - Fields: `id` (UUID), `productId`, `quantity` (positive Integer), `type`, `reason`, `createdBy`, `createdAt`
   - MovementType Enum: `IN`, `OUT`
   - Links `Product` and `User` with `onDelete: Restrict` to preserve transaction history.

5. **Challan (`challans`)**
   - Fields: `id` (UUID), `challanNumber` (unique), `customerId`, `status`, `createdBy`, `createdAt`, `updatedAt`
   - ChallanStatus Enum: `DRAFT`, `CONFIRMED`, `CANCELLED`
   - Links `Customer` and `User` with `onDelete: Restrict`.

6. **ChallanItem (`challan_items`)**
   - Fields: `id` (UUID), `challanId`, `productId`, `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot` (Decimal 12,2), `quantity`
   - Stores immutable historical product snapshot fields so historic challans remain accurate even if current product pricing or names change.
   - Composite unique constraint on `(challanId, productId)` preventing duplicate product entries on a single challan.

---

## 2. Integrity & Deletion Policies

- All major relationships (`User`, `Customer`, `Product`) enforce `onDelete: Restrict` to prevent accidental cascading deletion of historic records.
- Only `ChallanItem` to `Challan` uses `onDelete: Cascade` since item rows belong strictly to their parent challan document.
- Currency figures use fixed-precision `Decimal(12, 2)` instead of floating-point values to avoid rounding errors.

---

## 3. Database Infrastructure & Application Integration

- **Singleton Prisma Client**: Implemented `backend/src/config/prisma.ts` to manage database connection pooling and prevent leaks during development hot-reloading.
- **API Health Endpoint Update**: Updated `GET /api/health` in `backend/src/controllers/health.controller.ts` to include database connectivity status (`"database": "connected"`).
- **Graceful Shutdown**: Added process signal listeners in `backend/src/index.ts` to disconnect Prisma cleanly on shutdown.

---

## 4. Migrations & Seeding

- **Migration**: Generated and applied initial PostgreSQL migration `20260811075146_init_erp_crm_schema`.
- **Seed Script (`backend/prisma/seed.ts`)**: Populated deterministic development data:
  - 4 Users with bcrypt password hashes (`Password@123`).
  - 5 Realistic Customer profiles.
  - 8 Products across 4 categories, including 2 low-stock alert items.
  - 16 Stock Movement audit logs consistent with net current stock levels.

---

## 5. Verification Results

| Verification Step | Command | Status |
|---|---|---|
| Schema Format | `npx prisma format` | Success |
| Schema Validation | `npx prisma validate` | Success |
| Client Generation | `npx prisma generate` | Success |
| Database Migration | `npx prisma migrate dev` | Success |
| TypeScript Compilation | `npx tsc --noEmit` | Passed with zero errors |
| API Health Endpoint | `GET /api/health` | Returns `"database": "connected"` |
| Frontend Build | `npm run build` | Passed with zero errors |

---

## 6. Summary of Changed Files

- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `backend/prisma/migrations/20260811075146_init_erp_crm_schema/migration.sql`
- `backend/src/config/prisma.ts`
- `backend/src/controllers/health.controller.ts`
- `backend/src/index.ts`
- `backend/package.json`
- `backend/.env.example`
- `README.md`
- `WORK_SUMMARY.md`
- `workdone.md`
