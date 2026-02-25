import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { BannerController } from '../controllers/banner.controller';

const router = express.Router();

router.get('/', BannerController.getBanners);
router.post('/', requireAuth, BannerController.createBanner);
router.put('/:id', requireAuth, BannerController.updateBanner);
router.delete('/:id', requireAuth, BannerController.deleteBanner);

export default router;
