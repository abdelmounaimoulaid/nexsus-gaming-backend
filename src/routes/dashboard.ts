import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Protect dashboard route to admins only
router.get('/', requireAdmin, getDashboardStats);

export default router;
