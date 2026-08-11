import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateProductInput, ProductListQuery, UpdateProductInput } from '../validations/product.validation';

export class ProductService {
  static async list(query: ProductListQuery) {
    const { page, pageSize, search, category, lowStock } = query;
    const where: Prisma.ProductWhereInput = {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : {}),
    };

    if (lowStock) {
      // Prisma does not express a comparison between two scalar fields in this version.
      // The demo dataset is small, so filter the matching products before pagination.
      const products = (await prisma.product.findMany({ where, orderBy: { updatedAt: 'desc' } }))
        .filter((product) => product.currentStock <= product.minimumStock);
      const total = products.length;
      return { products: products.slice((page - 1) * pageSize, page * pageSize), pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.product.count({ where }),
    ]);
    return { products, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  static getById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  static create(data: CreateProductInput) {
    return prisma.product.create({ data });
  }

  static async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return prisma.product.update({ where: { id }, data });
  }
}
