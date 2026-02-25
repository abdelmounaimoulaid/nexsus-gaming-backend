import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { SectionController } from '../controllers/section.controller';

const router = express.Router();

router.get('/', SectionController.getSections);
router.post('/', requireAuth, SectionController.createSection);
router.put('/reorder', requireAuth, SectionController.reorderSections);
router.put('/:id', requireAuth, SectionController.updateSection);
router.delete('/:id', requireAuth, SectionController.deleteSection);

export default router;
