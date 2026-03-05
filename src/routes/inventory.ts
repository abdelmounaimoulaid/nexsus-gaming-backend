import express from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { InventoryController } from '../controllers/inventory.controller';

const router = express.Router();

router.get('/', requireAdmin, InventoryController.getInventory);
router.patch('/bulk', requireAdmin, InventoryController.bulkUpdateStock);
router.patch('/:id', requireAdmin, InventoryController.updateStock);

export default router;
