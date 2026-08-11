import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── DEVELOPMENT-ONLY seed credentials ──────────────────────────────────────
// WARNING: These credentials are for local development only.
// NEVER use these in production.
const SEED_PASSWORD = 'Password@123';
const SALT_ROUNDS = 10;

async function main() {
  console.log('[Seed] Seeding database...\n');

  // ─── 1. Users ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  const usersData = [
    { name: 'Admin User',     email: 'admin@minierp.dev',     role: Role.ADMIN },
    { name: 'Rahul Sharma',   email: 'rahul@minierp.dev',     role: Role.SALES },
    { name: 'Priya Patel',    email: 'priya@minierp.dev',     role: Role.WAREHOUSE },
    { name: 'Amit Verma',     email: 'amit@minierp.dev',      role: Role.ACCOUNTS },
  ];

  const users: Record<string, { id: string }> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { name: u.name, email: u.email, role: u.role, passwordHash },
    });
    users[u.role] = user;
    console.log(`  User: ${u.name} (${u.role}) — ${u.email}`);
  }

  // ─── 2. Customers ────────────────────────────────────────────────────────
  const customersData = [
    {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      email: 'rajesh@kumartraders.in',
      businessName: 'Kumar Traders',
      gstNumber: '27AABCU9603R1ZM',
      customerType: CustomerType.WHOLESALE,
      address: '12, MG Road, Pune 411001',
      status: CustomerStatus.ACTIVE,
      notes: 'Bulk buyer, pays on 15-day credit terms.',
    },
    {
      name: 'Sneha Reddy',
      mobile: '9123456780',
      email: 'sneha@reddydistributors.com',
      businessName: 'Reddy Distributors',
      gstNumber: '36AADCR4523K1ZP',
      customerType: CustomerType.DISTRIBUTOR,
      address: '88, Tank Bund Road, Hyderabad 500001',
      status: CustomerStatus.ACTIVE,
      notes: 'Distributes across Telangana region.',
    },
    {
      name: 'Vikram Singh',
      mobile: '9988776655',
      email: 'vikram@singhretail.in',
      businessName: 'Singh Retail Mart',
      customerType: CustomerType.RETAIL,
      address: '45, Civil Lines, Jaipur 302001',
      status: CustomerStatus.ACTIVE,
    },
    {
      name: 'Meena Iyer',
      mobile: '8877665544',
      email: 'meena@iyerfoods.com',
      businessName: 'Iyer Foods & Supplies',
      gstNumber: '33AACCI7891L1ZQ',
      customerType: CustomerType.WHOLESALE,
      address: '23, Anna Nagar, Chennai 600040',
      status: CustomerStatus.LEAD,
      followUpDate: new Date('2026-08-20'),
      notes: 'Interested in monthly bulk orders. Follow up next week.',
    },
    {
      name: 'Deepak Joshi',
      mobile: '7766554433',
      businessName: 'Joshi General Store',
      customerType: CustomerType.RETAIL,
      address: '9, Station Road, Nagpur 440001',
      status: CustomerStatus.INACTIVE,
      notes: 'Inactive since March 2026. Was a small-volume buyer.',
    },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.upsert({
      where: { id: c.mobile },
      update: {},
      create: c,
    }).catch(async () => {
      const existing = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
      if (existing) return existing;
      return prisma.customer.create({ data: c });
    });
    customers.push(customer);
    console.log(`  Customer: ${c.name} (${c.businessName}) — ${c.customerType}`);
  }

  // ─── 3. Products ─────────────────────────────────────────────────────────
  const productsData = [
    { name: 'Basmati Rice 25kg',       sku: 'RICE-BAS-25',   category: 'Grains',        unitPrice: 1250.00, currentStock: 200, minimumStock: 50,  warehouse: 'Warehouse-A' },
    { name: 'Toor Dal 10kg',           sku: 'DAL-TOOR-10',   category: 'Pulses',        unitPrice: 780.00,  currentStock: 150, minimumStock: 30,  warehouse: 'Warehouse-A' },
    { name: 'Sunflower Oil 5L',        sku: 'OIL-SUN-5L',    category: 'Oils',          unitPrice: 520.00,  currentStock: 300, minimumStock: 60,  warehouse: 'Warehouse-B' },
    { name: 'Sugar 50kg',              sku: 'SUG-WHT-50',    category: 'Sweeteners',    unitPrice: 1850.00, currentStock: 100, minimumStock: 25,  warehouse: 'Warehouse-A' },
    { name: 'Wheat Flour 10kg',        sku: 'FLR-WHT-10',    category: 'Grains',        unitPrice: 340.00,  currentStock: 180, minimumStock: 40,  warehouse: 'Warehouse-B' },
    { name: 'Mustard Oil 1L',          sku: 'OIL-MUS-1L',    category: 'Oils',          unitPrice: 185.00,  currentStock: 8,   minimumStock: 20,  warehouse: 'Warehouse-A' },  // Low stock
    { name: 'Chana Dal 5kg',           sku: 'DAL-CHNA-5',    category: 'Pulses',        unitPrice: 410.00,  currentStock: 3,   minimumStock: 15,  warehouse: 'Warehouse-B' },  // Low stock
    { name: 'Cardamom 250g',           sku: 'SPC-CARD-250',  category: 'Spices',        unitPrice: 650.00,  currentStock: 90,  minimumStock: 10,  warehouse: 'Warehouse-A' },
  ];

  const products: Record<string, { id: string }> = {};
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, category: p.category, unitPrice: p.unitPrice, currentStock: p.currentStock, minimumStock: p.minimumStock, warehouse: p.warehouse },
      create: p,
    });
    products[p.sku] = product;
    console.log(`  Product: ${p.name} (${p.sku}) — Stock: ${p.currentStock}/${p.minimumStock}`);
  }

  // ─── 4. Stock Movements ──────────────────────────────────────────────────
  await prisma.stockMovement.deleteMany({});

  const movementsData = [
    { sku: 'RICE-BAS-25', quantity: 250, type: MovementType.IN,  reason: 'Initial stock from supplier - Raj Agro',     createdBy: users.WAREHOUSE.id },
    { sku: 'RICE-BAS-25', quantity: 50,  type: MovementType.OUT, reason: 'Sold to Kumar Traders',                      createdBy: users.SALES.id },

    { sku: 'DAL-TOOR-10', quantity: 200, type: MovementType.IN,  reason: 'Bulk purchase from National Pulses Ltd',     createdBy: users.WAREHOUSE.id },
    { sku: 'DAL-TOOR-10', quantity: 50,  type: MovementType.OUT, reason: 'Dispatched to Reddy Distributors',           createdBy: users.SALES.id },

    { sku: 'OIL-SUN-5L',  quantity: 350, type: MovementType.IN,  reason: 'Restocked from Fortune warehouse',          createdBy: users.WAREHOUSE.id },
    { sku: 'OIL-SUN-5L',  quantity: 50,  type: MovementType.OUT, reason: 'Regular dispatch to Singh Retail Mart',      createdBy: users.SALES.id },

    { sku: 'SUG-WHT-50',  quantity: 120, type: MovementType.IN,  reason: 'Seasonal stock purchase',                    createdBy: users.WAREHOUSE.id },
    { sku: 'SUG-WHT-50',  quantity: 20,  type: MovementType.OUT, reason: 'Sold in local market',                       createdBy: users.SALES.id },

    { sku: 'FLR-WHT-10',  quantity: 200, type: MovementType.IN,  reason: 'Purchase from Ashirwad Mills',               createdBy: users.WAREHOUSE.id },
    { sku: 'FLR-WHT-10',  quantity: 20,  type: MovementType.OUT, reason: 'Dispatch to retail channel',                 createdBy: users.SALES.id },

    { sku: 'OIL-MUS-1L',  quantity: 30,  type: MovementType.IN,  reason: 'Small batch from local supplier',            createdBy: users.WAREHOUSE.id },
    { sku: 'OIL-MUS-1L',  quantity: 22,  type: MovementType.OUT, reason: 'High demand, urgent reorder needed',         createdBy: users.SALES.id },

    { sku: 'DAL-CHNA-5',  quantity: 18,  type: MovementType.IN,  reason: 'Partial delivery from supplier',             createdBy: users.WAREHOUSE.id },
    { sku: 'DAL-CHNA-5',  quantity: 15,  type: MovementType.OUT, reason: 'Cleared for wholesale order',                createdBy: users.SALES.id },

    { sku: 'SPC-CARD-250', quantity: 100, type: MovementType.IN,  reason: 'Premium spice batch from Kerala supplier',  createdBy: users.WAREHOUSE.id },
    { sku: 'SPC-CARD-250', quantity: 10,  type: MovementType.OUT, reason: 'Sample dispatch to new distributor lead',   createdBy: users.SALES.id },
  ];

  for (const m of movementsData) {
    await prisma.stockMovement.create({
      data: {
        productId: products[m.sku].id,
        quantity: m.quantity,
        type: m.type,
        reason: m.reason,
        createdBy: m.createdBy,
      },
    });
  }
  console.log(`  Stock Movements: ${movementsData.length} records created`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    products: await prisma.product.count(),
    stockMovements: await prisma.stockMovement.count(),
    challans: await prisma.challan.count(),
    challanItems: await prisma.challanItem.count(),
  };

  console.log('\n[Summary] Seed Results:');
  console.log(`   Users:           ${counts.users}`);
  console.log(`   Customers:       ${counts.customers}`);
  console.log(`   Products:        ${counts.products}`);
  console.log(`   Stock Movements: ${counts.stockMovements}`);
  console.log(`   Challans:        ${counts.challans}`);
  console.log(`   Challan Items:   ${counts.challanItems}`);
  console.log('\n[Seed] Complete.\n');

  console.log('──────────────────────────────────────────────');
  console.log('  DEVELOPMENT LOGIN CREDENTIALS');
  console.log('  (DO NOT USE IN PRODUCTION)');
  console.log('──────────────────────────────────────────────');
  console.log(`  Admin:     admin@minierp.dev    / ${SEED_PASSWORD}`);
  console.log(`  Sales:     rahul@minierp.dev    / ${SEED_PASSWORD}`);
  console.log(`  Warehouse: priya@minierp.dev    / ${SEED_PASSWORD}`);
  console.log(`  Accounts:  amit@minierp.dev     / ${SEED_PASSWORD}`);
  console.log('──────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('[Error] Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
