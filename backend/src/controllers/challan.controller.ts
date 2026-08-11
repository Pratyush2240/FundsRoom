import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ChallanError, ChallanService } from '../services/challan.service';
import { challanIdSchema, challanListQuerySchema, createChallanSchema } from '../validations/challan.validation';

const validationError = (res: Response, error: ZodError) => res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });

export const listChallans = async (req: Request, res: Response) => {
  const parsed = challanListQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  try {
    const result = await ChallanService.list(parsed.data);
    return res.status(200).json({ data: result.challans, pagination: result.pagination });
  } catch (error) {
    console.error('Challan list error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve challans' });
  }
};

export const getChallan = async (req: Request, res: Response) => {
  const parsed = challanIdSchema.safeParse(req.params);
  if (!parsed.success) return validationError(res, parsed.error);
  try {
    const challan = await ChallanService.getById(parsed.data.id);
    if (!challan) return res.status(404).json({ status: 'error', message: 'Challan not found' });
    return res.status(200).json({ data: challan });
  } catch (error) {
    console.error('Challan detail error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve challan' });
  }
};

export const createChallan = async (req: Request, res: Response) => {
  const parsed = createChallanSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  try {
    const challan = await ChallanService.create(parsed.data, req.user!.userId);
    return res.status(201).json({ status: 'success', data: challan });
  } catch (error) {
    if (error instanceof ChallanError) {
      const statusCode = error.code === 'CUSTOMER_NOT_FOUND' || error.code === 'PRODUCT_NOT_FOUND' ? 404 : 400;
      return res.status(statusCode).json({ status: 'error', message: error.message });
    }
    console.error('Challan create error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to create challan' });
  }
};
