import { MovementType } from '@prisma/client';
import { z } from 'zod';

export const movementIdSchema = z.object({ id: z.string().uuid('Invalid product ID') });

export const createMovementSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
  type: z.nativeEnum(MovementType),
  reason: z.string().trim().min(1, 'Reason is required').max(500),
});

export const movementListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  productId: z.string().uuid('Invalid product ID').optional(),
  type: z.nativeEnum(MovementType).optional(),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type MovementListQuery = z.infer<typeof movementListQuerySchema>;
