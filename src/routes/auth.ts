import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware'

const router = express.Router();

router.post('/login', AuthController.login);
router.put('/change-password', requireAuth, AuthController.changePassword);

export default router;
