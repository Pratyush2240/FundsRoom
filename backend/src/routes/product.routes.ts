import { Role } from '@prisma/client';
import { Router } from 'express';
import { createProduct, getProduct, listProducts, updateProduct } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), listProducts);
router.get('/:id', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), getProduct);
router.post('/', authorize(Role.ADMIN, Role.WAREHOUSE), createProduct);
router.patch('/:id', authorize(Role.ADMIN, Role.WAREHOUSE), updateProduct);
export default router;
