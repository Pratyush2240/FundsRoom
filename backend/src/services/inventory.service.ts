import { MovementType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateMovementInput, MovementListQuery } from '../validations/inventory.validation';

export class InventoryError extends Error {
  constructor(public readonly code: 'PRODUCT_NOT_FOUND' | 'INSUFFICIENT_STOCK') {
    super(code);
  }
}

export class InventoryService {
  static async listMovements(query: MovementListQuery) {
    const { page, pageSize, productId, type } = query;
    const where = { ...(productId ? { productId } : {}), ...(type ? { type } : {}) };
    const [movements, total] = await prisma.$transaction([
      prisma.stockMovement.findMany({
        where,
        include: { product: { select: { id: true, name: true, sku: true } }, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stockMovement.count({ where }),
    ]);
    return { movements, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  static async recordMovement(data: CreateMovementInput, createdBy: string) {
    return prisma.$transaction(async (transaction) => {
      if (data.type === MovementType.OUT) {
        const updated = await transaction.product.updateMany({
          where: { id: data.productId, currentStock: { gte: data.quantity } },
          data: { currentStock: { decrement: data.quantity } },
        });
        if (updated.count === 0) {
          const exists = await transaction.product.findUnique({ where: { id: data.productId }, select: { id: true } });
          throw new InventoryError(exists ? 'INSUFFICIENT_STOCK' : 'PRODUCT_NOT_FOUND');
        }
      } else {
        const updated = await transaction.product.updateMany({
          where: { id: data.productId },
          data: { currentStock: { increment: data.quantity } },
        });
        if (updated.count === 0) throw new InventoryError('PRODUCT_NOT_FOUND');
      }

      return transaction.stockMovement.create({
        data: { productId: data.productId, quantity: data.quantity, type: data.type, reason: data.reason, createdBy },
        include: { product: { select: { id: true, name: true, sku: true } }, user: { select: { id: true, name: true, email: true } } },
      });
    });
  }
}
