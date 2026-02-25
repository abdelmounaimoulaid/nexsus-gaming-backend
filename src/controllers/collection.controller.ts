import { Request, Response } from 'express';
import { CollectionService } from '../services/collection.service';

export class CollectionController {
    static async getCollections(req: Request, res: Response) {
        try {
            const collections = await CollectionService.getCollections();
            res.json(collections);
        } catch (e) {
            res.status(500).json({ message: 'Failed to fetch collections', error: String(e) });
        }
    }

    static async getCollectionById(req: Request, res: Response) {
        try {
            const collection = await CollectionService.getCollectionById(req.params.id as string);
            if (!collection) return res.status(404).json({ message: 'Collection not found' });
            res.json(collection);
        } catch (e) {
            res.status(500).json({ message: 'Failed to fetch collection' });
        }
    }

    static async createCollection(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const collection = await CollectionService.createCollection(req.body, userId);
            res.json(collection);
        } catch (e: any) {
            if (e?.code === 'P2002') return res.status(400).json({ message: 'Collection name or slug already exists.' });
            res.status(400).json({ message: 'Failed to create collection', error: String(e) });
        }
    }

    static async updateCollection(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const collection = await CollectionService.updateCollection(req.params.id as string, req.body, userId);
            res.json(collection);
        } catch (e: any) {
            if (e?.code === 'P2002') return res.status(400).json({ message: 'Collection name or slug already exists.' });
            res.status(400).json({ message: 'Failed to update collection', error: String(e) });
        }
    }

    static async deleteCollection(req: Request, res: Response) {
        try {
            await CollectionService.deleteCollection(req.params.id as string);
            res.json({ message: 'Collection deleted' });
        } catch (e) {
            res.status(400).json({ message: 'Failed to delete collection', error: String(e) });
        }
    }

    static async exportCollections(req: Request, res: Response) {
        try {
            const workbook = await CollectionService.exportCollectionsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="collections_export.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            res.status(500).json({ message: 'Failed to export collections', error: String(error) });
        }
    }

    static async importCollections(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
            const results = await CollectionService.importCollections(req.file);
            res.json({ message: 'Import completed', results });
        } catch (err: any) {
            res.status(500).json({ message: 'Import failed', error: String(err) });
        }
    }
}
