import express from 'express';
import { couponController } from '../controllers/coupon.controller';
import { requireAdmin, optionalAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// Admin routes
router.get('/', requireAdmin, couponController.getAll);
router.post('/', requireAdmin, couponController.create);
router.put('/:id', requireAdmin, couponController.update);
router.delete('/:id', requireAdmin, couponController.delete);

// Public routes
router.post('/validate', optionalAuth, couponController.validate);

export default router;
