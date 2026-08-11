import { MovementType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ChallanListQuery, CreateChallanInput } from '../validations/challan.validation';

export class ChallanError extends Error {
  constructor(public readonly code: 'CUSTOMER_NOT_FOUND' | 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK', message?: string) {
    super(message || code);
  }
}

export class ChallanService {
  static async list(query: ChallanListQuery) {
    const { page, pageSize, status, customerId } = query;
    const where: Prisma.ChallanWhereInput = {
      ...(status ? { status } : {}),
      ...(customerId ? { customerId } : {}),
    };

    const [challans, total] = await prisma.$transaction([
      prisma.challan.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          user: { select: { id: true, name: true } },
          items: { select: { quantity: true, unitPriceSnapshot: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.challan.count({ where }),
    ]);

    const data = challans.map((challan) => {
      const totalAmount = challan.items.reduce(
        (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
        0,
      );
      return {
        id: challan.id,
        challanNumber: challan.challanNumber,
        customer: challan.customer,
        status: challan.status,
        itemCount: challan.items.length,
        totalAmount,
        createdBy: challan.user,
        createdAt: challan.createdAt,
      };
    });

    return { challans: data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  static async getById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, businessName: true, mobile: true } },
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    });

    if (!challan) return null;

    const items = challan.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      sku: item.skuSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPriceSnapshot),
      lineTotal: Number(item.unitPriceSnapshot) * item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      id: challan.id,
      challanNumber: challan.challanNumber,
      customer: challan.customer,
      status: challan.status,
      items,
      totalAmount,
      createdBy: challan.user,
      createdAt: challan.createdAt,
      updatedAt: challan.updatedAt,
    };
  }

  static async create(input: CreateChallanInput, createdBy: string) {
    const createdId = await prisma.$transaction(async (tx) => {
      // 1. Validate customer
      const customer = await tx.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
      if (!customer) throw new ChallanError('CUSTOMER_NOT_FOUND', 'Customer not found');

      // 2. Validate products and check stock
      const productIds = input.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      const productMap = new Map(products.map((p) => [p.id, p]));
      for (const item of input.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new ChallanError('PRODUCT_NOT_FOUND', `Product not found: ${item.productId}`);
        if (product.currentStock < item.quantity) {
          throw new ChallanError('INSUFFICIENT_STOCK', `Insufficient stock for product ${product.name} (available: ${product.currentStock}, requested: ${item.quantity})`);
        }
      }

      // 3. Generate challan number: CH-YYYY-NNNN
      const year = new Date().getFullYear();
      const prefix = `CH-${year}-`;
      const lastChallan = await tx.challan.findFirst({
        where: { challanNumber: { startsWith: prefix } },
        orderBy: { challanNumber: 'desc' },
        select: { challanNumber: true },
      });
      const nextSeq = lastChallan ? parseInt(lastChallan.challanNumber.slice(prefix.length), 10) + 1 : 1;
      const challanNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;

      // 4. Create challan
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: input.customerId,
          status: 'CONFIRMED',
          createdBy,
        },
      });

      // 5. Create challan items, deduct stock, create stock movements
      for (const item of input.items) {
        const product = productMap.get(item.productId)!;

        await tx.challanItem.create({
          data: {
            challanId: challan.id,
            productId: item.productId,
            productNameSnapshot: product.name,
            skuSnapshot: product.sku,
            unitPriceSnapshot: product.unitPrice,
            quantity: item.quantity,
          },
        });

        // Deduct stock with optimistic locking
        const updated = await tx.product.updateMany({
          where: { id: item.productId, currentStock: { gte: item.quantity } },
          data: { currentStock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new ChallanError('INSUFFICIENT_STOCK', `Insufficient stock for product ${product.name}`);
        }

        // Record OUT stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: MovementType.OUT,
            reason: `Sales challan ${challanNumber}`,
            createdBy,
          },
        });
      }

      // 6. Return created challan ID
      return challan.id;
    });

    return this.getById(createdId);
  }
}
