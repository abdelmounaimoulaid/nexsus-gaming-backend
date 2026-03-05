import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { AddressController } from '../controllers/address.controller';
import { validate } from '../middlewares/validate.middleware';
import { createAddressSchema, updateAddressSchema } from '../validations/order.validation';

const router = express.Router();

router.get('/my', requireAuth, AddressController.getMyAddresses);
router.post('/', requireAuth, validate(createAddressSchema), AddressController.createAddress);
router.patch('/:id', requireAuth, validate(updateAddressSchema), AddressController.updateAddress);
router.delete('/:id', requireAuth, AddressController.deleteAddress);
router.post('/:id/set-default', requireAuth, AddressController.setDefault);

export default router;
