import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
    static async getInventory(req: Request, res: Response) {
        try {
            const result = await InventoryService.getInventory(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch inventory', error: String(error) });
        }
    }

    static async updateStock(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { stock } = req.body;
            const userId = (req as any).user?.id;

            if (typeof stock !== 'number') {
                return res.status(400).json({ message: 'Stock must be a number' });
            }

            const updated = await InventoryService.updateStock(id, stock, userId);
            res.json(updated);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update stock', error: String(error) });
        }
    }

    static async bulkUpdateStock(req: Request, res: Response) {
        try {
            const { updates } = req.body;
            const userId = (req as any).user?.id;

            if (!Array.isArray(updates)) {
                return res.status(400).json({ message: 'Updates must be an array' });
            }

            const result = await InventoryService.bulkUpdateStock(updates, userId);
            res.json({ success: true, count: result.length });
        } catch (error) {
            res.status(400).json({ message: 'Failed to bulk update stock', error: String(error) });
        }
    }
}
