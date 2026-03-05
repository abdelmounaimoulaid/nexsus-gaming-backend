import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { requireAuth, optionalAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema } from '../validations/order.validation';

const router = Router();

// Public/User routes
router.post('/', optionalAuth, validate(createOrderSchema), OrderController.create);

// Admin routes
router.get('/', requireAdmin, OrderController.getAll);
router.get('/:id', requireAdmin, OrderController.getById);
router.put('/:id/status', requireAdmin, OrderController.updateStatus);
router.delete('/:id', requireAdmin, OrderController.delete);

export default router;
