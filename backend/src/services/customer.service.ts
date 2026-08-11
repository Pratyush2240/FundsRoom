import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CreateCustomerInput, CustomerListQuery, UpdateCustomerInput } from '../validations/customer.validation';

export class CustomerService {
  static async list(query: CustomerListQuery) {
    const { page, pageSize, search, status, customerType } = query;
    const where: Prisma.CustomerWhereInput = {
      ...(status ? { status } : {}),
      ...(customerType ? { customerType } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { businessName: { contains: search, mode: 'insensitive' } },
              { mobile: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [customers, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    };
  }

  static async getById(id: string) {
    return prisma.customer.findUnique({ where: { id } });
  }

  static async create(data: CreateCustomerInput) {
    return prisma.customer.create({ data });
  }

  static async update(id: string, data: UpdateCustomerInput) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return null;

    return prisma.customer.update({ where: { id }, data });
  }
}
