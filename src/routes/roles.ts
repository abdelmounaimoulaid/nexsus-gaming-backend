import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { RoleController } from '../controllers/role.controller';

const router = express.Router();

router.get('/', requireAuth, RoleController.getRoles);
router.get('/:id', requireAuth, RoleController.getRoleById);

router.post('/', requireAuth, RoleController.createRole);
router.patch('/:id', requireAuth, RoleController.updateRole);
router.delete('/:id', requireAuth, RoleController.deleteRole);

export default router;
