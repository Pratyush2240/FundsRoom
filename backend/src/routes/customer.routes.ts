import { Role } from '@prisma/client';
import { Router } from 'express';
import { createCustomer, getCustomer, listCustomers, updateCustomer } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const readRoles = [Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS];
const manageRoles = [Role.ADMIN, Role.SALES];

router.use(authenticate);
router.get('/', authorize(...readRoles), listCustomers);
router.get('/:id', authorize(...readRoles), getCustomer);
router.post('/', authorize(...manageRoles), createCustomer);
router.patch('/:id', authorize(...manageRoles), updateCustomer);

export default router;
