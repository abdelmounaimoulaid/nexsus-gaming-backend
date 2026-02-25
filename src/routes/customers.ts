import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { CustomerController } from '../controllers/customer.controller';

const router = express.Router();

router.get('/', requireAuth, CustomerController.getCustomers);
router.post('/', requireAuth, CustomerController.createCustomer);
router.patch('/:id', requireAuth, CustomerController.updateCustomer);
router.delete('/:id', requireAuth, CustomerController.deleteCustomer);

export default router;
