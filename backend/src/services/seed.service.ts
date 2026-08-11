import { CustomerStatus, CustomerType, MovementType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

const SEED_PASSWORD = 'Password@123';
const SALT_ROUNDS = 10;

const SEED_IDS = {
  users: {
    ADMIN: '00000000-0000-4000-8000-000000000001',
    SALES: '00000000-0000-4000-8000-000000000002',
    WAREHOUSE: '00000000-0000-4000-8000-000000000003',
    ACCOUNTS: '00000000-0000-4000-8000-000000000004',
  },
  customers: [
    '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000105',
  ],
  products: [
    '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000208',
  ],
  movements: Array.from({ length: 16 }, (_, index) =>
    `00000000-0000-4000-8000-${String(index + 301).padStart(12, '0')}`
  ),
};

export async function seedInitialData() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  const usersData = [
    { id: SEED_IDS.users.ADMIN, name: 'Admin User', email: 'admin@minierp.dev', role: Role.ADMIN },
    { id: SEED_IDS.users.SALES, name: 'Rahul Sharma', email: 'rahul@minierp.dev', role: Role.SALES },
    { id: SEED_IDS.users.WAREHOUSE, name: 'Priya Patel', email: 'priya@minierp.dev', role: Role.WAREHOUSE },
    { id: SEED_IDS.users.ACCOUNTS, name: 'Amit Verma', email: 'amit@minierp.dev', role: Role.ACCOUNTS },
  ];

  const users: Record<Role, { id: string }> = {} as Record<Role, { id: string }>;
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name, role: userData.role, passwordHash },
      create: { ...userData, passwordHash },
    });
    users[userData.role] = user;
  }

  const customersData = [
    { id: SEED_IDS.customers[0], name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@kumartraders.in', businessName: 'Kumar Traders', gstNumber: '27AABCU9603R1ZM', customerType: CustomerType.WHOLESALE, address: '12, MG Road, Pune 411001', status: CustomerStatus.ACTIVE, notes: 'Bulk buyer, pays on 15-day credit terms.' },
    { id: SEED_IDS.customers[1], name: 'Sneha Reddy', mobile: '9123456780', email: 'sneha@reddydistributors.com', businessName: 'Reddy Distributors', gstNumber: '36AADCR4523K1ZP', customerType: CustomerType.DISTRIBUTOR, address: '88, Tank Bund Road, Hyderabad 500001', status: CustomerStatus.ACTIVE, notes: 'Distributes across Telangana region.' },
    { id: SEED_IDS.customers[2], name: 'Vikram Singh', mobile: '9988776655', email: 'vikram@singhretail.in', businessName: 'Singh Retail Mart', customerType: CustomerType.RETAIL, address: '45, Civil Lines, Jaipur 302001', status: CustomerStatus.ACTIVE },
    { id: SEED_IDS.customers[3], name: 'Meena Iyer', mobile: '8877665544', email: 'meena@iyerfoods.com', businessName: 'Iyer Foods & Supplies', gstNumber: '33AACCI7891L1ZQ', customerType: CustomerType.WHOLESALE, address: '23, Anna Nagar, Chennai 600040', status: CustomerStatus.LEAD, followUpDate: new Date('2026-08-20'), notes: 'Interested in monthly bulk orders. Follow up next week.' },
    { id: SEED_IDS.customers[4], name: 'Deepak Joshi', mobile: '7766554433', businessName: 'Joshi General Store', customerType: CustomerType.RETAIL, address: '9, Station Road, Nagpur 440001', status: CustomerStatus.INACTIVE, notes: 'Inactive since March 2026. Was a small-volume buyer.' },
  ];

  for (const customerData of customersData) {
    const existing = await prisma.customer.findUnique({ where: { id: customerData.id } })
      ?? await prisma.customer.findFirst({
        where: { mobile: customerData.mobile, businessName: customerData.businessName },
      });
    if (existing) {
      const { id: _id, ...customerUpdate } = customerData;
      await prisma.customer.update({ where: { id: existing.id }, data: customerUpdate });
    } else {
      await prisma.customer.create({ data: customerData });
    }
  }

  const productsData = [
    { id: SEED_IDS.products[0], name: 'Basmati Rice 25kg', sku: 'RICE-BAS-25', category: 'Grains', unitPrice: 1250, currentStock: 200, minimumStock: 50, warehouse: 'Warehouse-A' },
    { id: SEED_IDS.products[1], name: 'Toor Dal 10kg', sku: 'DAL-TOOR-10', category: 'Pulses', unitPrice: 780, currentStock: 150, minimumStock: 30, warehouse: 'Warehouse-A' },
    { id: SEED_IDS.products[2], name: 'Sunflower Oil 5L', sku: 'OIL-SUN-5L', category: 'Oils', unitPrice: 520, currentStock: 300, minimumStock: 60, warehouse: 'Warehouse-B' },
    { id: SEED_IDS.products[3], name: 'Sugar 50kg', sku: 'SUG-WHT-50', category: 'Sweeteners', unitPrice: 1850, currentStock: 100, minimumStock: 25, warehouse: 'Warehouse-A' },
    { id: SEED_IDS.products[4], name: 'Wheat Flour 10kg', sku: 'FLR-WHT-10', category: 'Grains', unitPrice: 340, currentStock: 180, minimumStock: 40, warehouse: 'Warehouse-B' },
    { id: SEED_IDS.products[5], name: 'Mustard Oil 1L', sku: 'OIL-MUS-1L', category: 'Oils', unitPrice: 185, currentStock: 8, minimumStock: 20, warehouse: 'Warehouse-A' },
    { id: SEED_IDS.products[6], name: 'Chana Dal 5kg', sku: 'DAL-CHNA-5', category: 'Pulses', unitPrice: 410, currentStock: 3, minimumStock: 15, warehouse: 'Warehouse-B' },
    { id: SEED_IDS.products[7], name: 'Cardamom 250g', sku: 'SPC-CARD-250', category: 'Spices', unitPrice: 650, currentStock: 90, minimumStock: 10, warehouse: 'Warehouse-A' },
  ];

  const products: Record<string, { id: string }> = {};
  for (const productData of productsData) {
    const { id: _id, ...productUpdate } = productData;
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: productUpdate,
      create: productData,
    });
    products[productData.sku] = product;
  }

  const movementsData = [
    ['RICE-BAS-25', 250, MovementType.IN, 'Initial stock from supplier - Raj Agro', users.WAREHOUSE.id], ['RICE-BAS-25', 50, MovementType.OUT, 'Sold to Kumar Traders', users.SALES.id],
    ['DAL-TOOR-10', 200, MovementType.IN, 'Bulk purchase from National Pulses Ltd', users.WAREHOUSE.id], ['DAL-TOOR-10', 50, MovementType.OUT, 'Dispatched to Reddy Distributors', users.SALES.id],
    ['OIL-SUN-5L', 350, MovementType.IN, 'Restocked from Fortune warehouse', users.WAREHOUSE.id], ['OIL-SUN-5L', 50, MovementType.OUT, 'Regular dispatch to Singh Retail Mart', users.SALES.id],
    ['SUG-WHT-50', 120, MovementType.IN, 'Seasonal stock purchase', users.WAREHOUSE.id], ['SUG-WHT-50', 20, MovementType.OUT, 'Sold in local market', users.SALES.id],
    ['FLR-WHT-10', 200, MovementType.IN, 'Purchase from Ashirwad Mills', users.WAREHOUSE.id], ['FLR-WHT-10', 20, MovementType.OUT, 'Dispatch to retail channel', users.SALES.id],
    ['OIL-MUS-1L', 30, MovementType.IN, 'Small batch from local supplier', users.WAREHOUSE.id], ['OIL-MUS-1L', 22, MovementType.OUT, 'High demand, urgent reorder needed', users.SALES.id],
    ['DAL-CHNA-5', 18, MovementType.IN, 'Partial delivery from supplier', users.WAREHOUSE.id], ['DAL-CHNA-5', 15, MovementType.OUT, 'Cleared for wholesale order', users.SALES.id],
    ['SPC-CARD-250', 100, MovementType.IN, 'Premium spice batch from Kerala supplier', users.WAREHOUSE.id], ['SPC-CARD-250', 10, MovementType.OUT, 'Sample dispatch to new distributor lead', users.SALES.id],
  ] as const;

  for (const [index, [sku, quantity, type, reason, createdBy]] of movementsData.entries()) {
    const data = { id: SEED_IDS.movements[index], productId: products[sku].id, quantity, type, reason, createdBy };
    const existing = await prisma.stockMovement.findUnique({ where: { id: data.id } })
      ?? await prisma.stockMovement.findFirst({ where: { productId: data.productId, quantity, type, reason, createdBy } });
    if (!existing) await prisma.stockMovement.create({ data });
  }

  const counts = await Promise.all([
    prisma.user.count(), prisma.customer.count(), prisma.product.count(), prisma.stockMovement.count(),
  ]);
  return counts;
}
