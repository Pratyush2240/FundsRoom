import { z } from 'zod';

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);
const optionalText = z.string().trim().optional();

const productFields = {
  name: requiredText('Name'),
  sku: requiredText('SKU'),
  category: requiredText('Category'),
  unitPrice: z.coerce.number().finite().min(0, 'Unit price cannot be negative'),
  currentStock: z.coerce.number().int().min(0, 'Current stock cannot be negative').optional(),
  minimumStock: z.coerce.number().int().min(0, 'Minimum stock cannot be negative').optional(),
  warehouse: requiredText('Warehouse'),
};

export const createProductSchema = z.object({
  ...productFields,
  currentStock: productFields.currentStock.default(0),
  minimumStock: productFields.minimumStock.default(0),
});

export const updateProductSchema = z.object({
  name: productFields.name.optional(),
  sku: productFields.sku.optional(),
  category: productFields.category.optional(),
  unitPrice: productFields.unitPrice.optional(),
  currentStock: productFields.currentStock,
  minimumStock: productFields.minimumStock,
  warehouse: productFields.warehouse.optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field is required');

export const productIdSchema = z.object({ id: z.string().uuid('Invalid product ID') });

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  lowStock: z.enum(['true', 'false']).optional().transform((value) => value === 'true'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
