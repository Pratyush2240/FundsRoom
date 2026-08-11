import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { InventoryError, InventoryService } from '../services/inventory.service';
import { createMovementSchema, movementListQuerySchema } from '../validations/inventory.validation';

const validationError = (res: Response, error: ZodError) => res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });

export const listMovements = async (req: Request, res: Response) => {
  const parsed = movementListQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  try { const result = await InventoryService.listMovements(parsed.data); return res.status(200).json({ data: result.movements, pagination: result.pagination }); }
  catch (error) { console.error('Inventory list error:', error); return res.status(500).json({ status: 'error', message: 'Unable to retrieve stock movements' }); }
};

export const createMovement = async (req: Request, res: Response) => {
  const parsed = createMovementSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  try {
    const movement = await InventoryService.recordMovement(parsed.data, req.user!.userId);
    return res.status(201).json({ status: 'success', data: movement });
  } catch (error) {
    if (error instanceof InventoryError) {
      const message = error.code === 'PRODUCT_NOT_FOUND' ? 'Product not found' : 'Insufficient stock for this OUT movement';
      return res.status(400).json({ status: 'error', message });
    }
    console.error('Inventory movement error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to record stock movement' });
  }
};
