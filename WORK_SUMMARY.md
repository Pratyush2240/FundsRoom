# Mini ERP + CRM Operations Portal — Work Summary

**Project:** Full Stack Developer Case Study  
**Date:** August 11, 2026  

---

## Step 1 — Project Initialization (Complete)

- Monorepo structure: `/backend` + `/frontend`
- Backend: Express + TypeScript + `GET /api/health`
- Frontend: React + Vite + Tailwind CSS admin shell
- Environment variables, `.gitignore`, README
- Both servers verified running

---

## Step 2 — Database Design, Prisma, Migrations & Seed Data (Complete)

### Files Created / Modified

| File | Action |
|---|---|
| `backend/prisma/schema.prisma` | **Created** — Full ERP schema (6 models, 5 enums) |
| `backend/prisma/seed.ts` | **Created** — Professional seed script with bcrypt |
| `backend/prisma/migrations/` | **Created** — `init_erp_crm_schema` migration |
| `backend/src/config/prisma.ts` | **Created** — Singleton PrismaClient |
| `backend/src/controllers/health.controller.ts` | **Modified** — Added database connectivity check |
| `backend/src/index.ts` | **Modified** — Added graceful Prisma shutdown |
| `backend/package.json` | **Modified** — Added Prisma scripts + seed config |
| `backend/.env.example` | **Modified** — Updated with placeholder format |
| `README.md` | **Modified** — Added database docs, schema, seed credentials |

### Prisma Models (6)

| Model | Table | Key Design Decisions |
|---|---|---|
| **User** | `users` | UUID PK, email unique, passwordHash stored (never plaintext) |
| **Customer** | `customers` | Optional email/gstNumber/followUpDate/notes. 5 indexes for search |
| **Product** | `products` | SKU unique, Decimal(12,2) for unitPrice, integer stock fields |
| **StockMovement** | `stock_movements` | Positive quantity, type determines IN/OUT, Restrict on delete |
| **Challan** | `challans` | challanNumber unique, Restrict delete for customer/user FK |
| **ChallanItem** | `challan_items` | Product snapshot fields, composite unique (challanId + productId) |

### Enums (5)

`Role`, `CustomerType`, `CustomerStatus`, `MovementType`, `ChallanStatus`

### Relationship Summary

```text
User --> StockMovement (createdBy, onDelete: Restrict)
User --> Challan (createdBy, onDelete: Restrict)
Customer --> Challan (customerId, onDelete: Restrict)
Product --> StockMovement (productId, onDelete: Restrict)
Product --> ChallanItem (productId, onDelete: Restrict)
Challan --> ChallanItem (challanId, onDelete: Cascade)
```

### Important Constraints

- `users.email` — UNIQUE
- `products.sku` — UNIQUE
- `challans.challan_number` — UNIQUE
- `challan_items.(challan_id, product_id)` — COMPOSITE UNIQUE
- All FK relations use `onDelete: Restrict` except ChallanItem -> Challan (Cascade)
- Monetary values use `Decimal(12,2)`, never float

### Indexes (19 total)

- **User**: email (unique)
- **Customer**: name, mobile, businessName, status, customerType
- **Product**: sku (unique), category, warehouse
- **StockMovement**: productId, createdBy, createdAt, type
- **Challan**: challanNumber (unique), customerId, status, createdBy, createdAt
- **ChallanItem**: challanId, productId, composite unique

### Migration

- Name: `20260811075146_init_erp_crm_schema`
- Status: Applied successfully
- Creates 5 enums, 6 tables, 19 indexes, 6 foreign keys

### Seed Data Summary

| Entity | Count | Details |
|---|---|---|
| Users | 4 | 1 ADMIN, 1 SALES, 1 WAREHOUSE, 1 ACCOUNTS (bcrypt hashed) |
| Customers | 5 | 2 WHOLESALE, 2 RETAIL, 1 DISTRIBUTOR. Mix of ACTIVE/LEAD/INACTIVE |
| Products | 8 | 4 categories. 2 low-stock items (Mustard Oil 8/20, Chana Dal 3/15) |
| Stock Movements | 16 | 8 IN + 8 OUT. Net movements match product currentStock values |
| Challans | 0 | None seeded (will be created through challan API in Step 4) |

### Verification Commands Executed

| Command | Result |
|---|---|
| `npx prisma format` | Schema formatted |
| `npx prisma validate` | Schema valid |
| `npx prisma generate` | Client generated |
| `npx prisma migrate dev --name init_erp_crm_schema` | Migration applied, seed ran |
| `npx tsc --noEmit` | TypeScript compiles cleanly |
| `GET /api/health` | Returns `"database":"connected"` |
| Verification script | All 4 users, 5 customers, 8 products, 16 movements confirmed |

### Design Decisions for Future Steps

1. **ChallanItem snapshot fields** — When creating a challan, copy `product.name`, `product.sku`, `product.unitPrice` into snapshot fields. Do NOT rely solely on productId for display.
2. **Stock deduction** — Must be done in a transaction when confirming a challan. Check `currentStock >= requestedQuantity` before deducting.
3. **Challan numbering** — `challanNumber` is unique but generation logic is not yet implemented. Suggest format like `CH-YYYYMMDD-XXXX`.
4. **User passwords** — Stored as bcrypt hashes. Login endpoint will need `bcrypt.compare()`.
5. **Delete protection** — All Restrict FKs mean the app layer should deactivate/archive instead of deleting records with dependencies.
