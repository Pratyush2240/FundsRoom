import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CustomerService } from '../services/customer.service';
import {
  createCustomerSchema,
  customerIdSchema,
  customerListQuerySchema,
  updateCustomerSchema,
} from '../validations/customer.validation';

const validationError = (res: Response, error: ZodError) =>
  res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors: error.errors.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
  });

export const listCustomers = async (req: Request, res: Response) => {
  const parsed = customerListQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);

  try {
    const result = await CustomerService.list(parsed.data);
    return res.status(200).json({ data: result.customers, pagination: result.pagination });
  } catch (error) {
    console.error('Customer list error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve customers' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  const parsed = customerIdSchema.safeParse(req.params);
  if (!parsed.success) return validationError(res, parsed.error);

  try {
    const customer = await CustomerService.getById(parsed.data.id);
    if (!customer) return res.status(404).json({ status: 'error', message: 'Customer not found' });
    return res.status(200).json({ data: customer });
  } catch (error) {
    console.error('Customer detail error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  try {
    const customer = await CustomerService.create(parsed.data);
    return res.status(201).json({ status: 'success', data: customer });
  } catch (error) {
    console.error('Customer create error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  const params = customerIdSchema.safeParse(req.params);
  if (!params.success) return validationError(res, params.error);
  const body = updateCustomerSchema.safeParse(req.body);
  if (!body.success) return validationError(res, body.error);

  try {
    const customer = await CustomerService.update(params.data.id, body.data);
    if (!customer) return res.status(404).json({ status: 'error', message: 'Customer not found' });
    return res.status(200).json({ status: 'success', data: customer });
  } catch (error) {
    console.error('Customer update error:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to update customer' });
  }
};
