import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import multer from 'multer';
import { CollectionController } from '../controllers/collection.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', CollectionController.getCollections);
router.get('/:id', CollectionController.getCollectionById);

router.post('/', requireAuth, CollectionController.createCollection);
router.put('/:id', requireAuth, CollectionController.updateCollection);
router.delete('/:id', requireAuth, CollectionController.deleteCollection);

router.get('/data/export', requireAuth, CollectionController.exportCollections);
router.post('/data/import', requireAuth, upload.single('file'), CollectionController.importCollections);

export default router;
