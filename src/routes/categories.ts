import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth.middleware';
import { CategoryController } from '../controllers/category.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', CategoryController.getCategories);
router.post('/', requireAuth, CategoryController.createCategory);
router.put('/:id', requireAuth, CategoryController.updateCategory);
router.delete('/:id', requireAuth, CategoryController.deleteCategory);

router.get('/export', requireAuth, CategoryController.exportCategories);
router.post('/import', requireAuth, upload.single('file'), CategoryController.importCategories);

export default router;
