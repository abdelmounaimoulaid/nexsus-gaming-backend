import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import multer from 'multer';
import { BrandController } from '../controllers/brand.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', BrandController.getBrands);
router.get('/:id', BrandController.getBrandById);

router.post('/', requireAuth, BrandController.createBrand);
router.put('/:id', requireAuth, BrandController.updateBrand);
router.delete('/:id', requireAuth, BrandController.deleteBrand);

router.get('/data/export', requireAuth, BrandController.exportBrands);
router.post('/data/import', requireAuth, upload.single('file'), BrandController.importBrands);

export default router;
