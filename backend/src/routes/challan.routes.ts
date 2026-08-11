import { Role } from '@prisma/client';
import { Router } from 'express';
import { createChallan, getChallan, listChallans } from '../controllers/challan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), listChallans);
router.get('/:id', authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), getChallan);
router.post('/', authorize(Role.ADMIN, Role.SALES), createChallan);
export default router;
