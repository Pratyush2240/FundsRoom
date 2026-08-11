import { Role } from '@prisma/client';
import { Router } from 'express';
import { createMovement, listMovements } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/movements', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), listMovements);
router.post('/movements', authorize(Role.ADMIN, Role.WAREHOUSE), createMovement);
export default router;
