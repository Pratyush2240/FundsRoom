import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ProductService } from '../services/product.service';
import { createProductSchema, productIdSchema, productListQuerySchema, updateProductSchema } from '../validations/product.validation';

const validationError = (res: Response, error: ZodError) => res.status(400).json({ status: 'error', message: 'Validation failed', errors: error.errors.map((issue) => ({ field: issue.path.join('.'), message: issue.message })) });
const duplicateSku = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

export const listProducts = async (req: Request, res: Response) => {
  const parsed = productListQuerySchema.safeParse(req.query);
  if (!parsed.success) return validationError(res, parsed.error);
  try { const result = await ProductService.list(parsed.data); return res.status(200).json({ data: result.products, pagination: result.pagination }); }
  catch (error) { console.error('Product list error:', error); return res.status(500).json({ status: 'error', message: 'Unable to retrieve products' }); }
};

export const getProduct = async (req: Request, res: Response) => {
  const parsed = productIdSchema.safeParse(req.params);
  if (!parsed.success) return validationError(res, parsed.error);
  try { const product = await ProductService.getById(parsed.data.id); if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' }); return res.status(200).json({ data: product }); }
  catch (error) { console.error('Product detail error:', error); return res.status(500).json({ status: 'error', message: 'Unable to retrieve product' }); }
};

export const createProduct = async (req: Request, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  try { const product = await ProductService.create(parsed.data); return res.status(201).json({ status: 'success', data: product }); }
  catch (error) { if (duplicateSku(error)) return res.status(409).json({ status: 'error', message: 'A product with this SKU already exists' }); console.error('Product create error:', error); return res.status(500).json({ status: 'error', message: 'Unable to create product' }); }
};

export const updateProduct = async (req: Request, res: Response) => {
  const params = productIdSchema.safeParse(req.params);
  if (!params.success) return validationError(res, params.error);
  const body = updateProductSchema.safeParse(req.body);
  if (!body.success) return validationError(res, body.error);
  try { const product = await ProductService.update(params.data.id, body.data); if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' }); return res.status(200).json({ status: 'success', data: product }); }
  catch (error) { if (duplicateSku(error)) return res.status(409).json({ status: 'error', message: 'A product with this SKU already exists' }); console.error('Product update error:', error); return res.status(500).json({ status: 'error', message: 'Unable to update product' }); }
};
