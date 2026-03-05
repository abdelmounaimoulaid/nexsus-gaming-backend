import { Request, Response } from 'express';
import { WhishlistService } from '../services/whishlist.service';

export class WhishlistController {
    static async toggleWhishlist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { productId } = req.body;

            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }

            const result = await WhishlistService.toggleWhishlist(userId, productId);
            return res.json(result);
        } catch (error: any) {
            console.error('Toggle whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async getWhishlist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const favorites = await WhishlistService.getUserWhishlist(userId);
            return res.json(favorites);
        } catch (error: any) {
            console.error('Get whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async syncWhishlist(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const { productIds } = req.body;

            if (!Array.isArray(productIds)) {
                return res.status(400).json({ message: 'productIds must be an array' });
            }

            const favorites = await WhishlistService.syncWhishlist(userId, productIds);
            return res.json(favorites);
        } catch (error: any) {
            console.error('Sync whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
