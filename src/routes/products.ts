import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import { ProductController } from '../controllers/product.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', ProductController.getProducts);
router.get('/export', requireAuth, ProductController.exportProducts);
router.get('/:id', ProductController.getProductById);

router.post('/', requireAuth, ProductController.createProduct);
router.put('/:id', requireAuth, ProductController.updateProduct);

router.post('/import', requireAuth, upload.single('file'), ProductController.importProducts);

router.delete('/bulk', requireAuth, ProductController.bulkDeleteProducts);
router.delete('/:id', requireAuth, ProductController.deleteProduct);

export default router;
