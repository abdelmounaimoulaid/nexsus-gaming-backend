import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Public route to fetch necessary global site settings
router.get('/', getSettings);

// Protected admin route to save global site settings
router.put('/', requireAuth, updateSettings);

export default router;
