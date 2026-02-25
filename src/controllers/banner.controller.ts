import { Request, Response } from 'express';
import { BannerService } from '../services/banner.service';

export class BannerController {
    static async getBanners(req: Request, res: Response) {
        try {
            const banners = await BannerService.getBanners();
            res.json(banners);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch banners' });
        }
    }

    static async createBanner(req: Request, res: Response) {
        try {
            const banner = await BannerService.createBanner(req.body);
            res.json(banner);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create banner' });
        }
    }

    static async updateBanner(req: Request, res: Response) {
        try {
            const banner = await BannerService.updateBanner(req.params.id as string, req.body);
            res.json(banner);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update banner' });
        }
    }

    static async deleteBanner(req: Request, res: Response) {
        try {
            await BannerService.deleteBanner(req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete banner' });
        }
    }
}
