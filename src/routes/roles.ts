import express from 'express';
import { requireAdmin } from '../middlewares/auth.middleware';
import { RoleController } from '../controllers/role.controller';

const router = express.Router();

router.get('/', requireAdmin, RoleController.getRoles);
router.get('/:id', requireAdmin, RoleController.getRoleById);

router.post('/', requireAdmin, RoleController.createRole);
router.patch('/:id', requireAdmin, RoleController.updateRole);
router.delete('/:id', requireAdmin, RoleController.deleteRole);

export default router;
