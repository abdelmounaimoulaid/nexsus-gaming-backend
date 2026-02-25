import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = express.Router();

router.get('/', requireAuth, UserController.getUsers);
router.post('/', requireAuth, UserController.createUser);
router.patch('/:id', requireAuth, UserController.updateUser);
router.delete('/:id', requireAuth, UserController.deleteUser);

export default router;
