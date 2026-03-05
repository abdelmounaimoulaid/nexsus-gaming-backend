import express from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = express.Router();

router.get('/', requireAdmin, UserController.getUsers);
router.post('/', requireAdmin, UserController.createUser);
router.patch('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

export default router;
