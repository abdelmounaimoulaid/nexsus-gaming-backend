import express from 'express';
import { WhishlistController } from '../controllers/whishlist.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/toggle', requireAuth, WhishlistController.toggleWhishlist);
router.get('/', requireAuth, WhishlistController.getWhishlist);
router.post('/sync', requireAuth, WhishlistController.syncWhishlist);

export default router;
