import { ChallanStatus } from '@prisma/client';
import { z } from 'zod';

export const challanIdSchema = z.object({ id: z.string().uuid('Invalid challan ID') });

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
      })
    )
    .min(1, 'At least one item is required')
    .refine((items) => new Set(items.map((i) => i.productId)).size === items.length, {
      message: 'Duplicate products are not allowed in items list',
    }),
});

export const challanListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.nativeEnum(ChallanStatus).optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type ChallanListQuery = z.infer<typeof challanListQuerySchema>;
