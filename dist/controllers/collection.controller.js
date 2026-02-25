"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const collection_service_1 = require("../services/collection.service");
class CollectionController {
    static async getCollections(req, res) {
        try {
            const collections = await collection_service_1.CollectionService.getCollections();
            res.json(collections);
        }
        catch (e) {
            res.status(500).json({ message: 'Failed to fetch collections', error: String(e) });
        }
    }
    static async getCollectionById(req, res) {
        try {
            const collection = await collection_service_1.CollectionService.getCollectionById(req.params.id);
            if (!collection)
                return res.status(404).json({ message: 'Collection not found' });
            res.json(collection);
        }
        catch (e) {
            res.status(500).json({ message: 'Failed to fetch collection' });
        }
    }
    static async createCollection(req, res) {
        try {
            const userId = req.user?.id;
            const collection = await collection_service_1.CollectionService.createCollection(req.body, userId);
            res.json(collection);
        }
        catch (e) {
            if (e?.code === 'P2002')
                return res.status(400).json({ message: 'Collection name or slug already exists.' });
            res.status(400).json({ message: 'Failed to create collection', error: String(e) });
        }
    }
    static async updateCollection(req, res) {
        try {
            const userId = req.user?.id;
            const collection = await collection_service_1.CollectionService.updateCollection(req.params.id, req.body, userId);
            res.json(collection);
        }
        catch (e) {
            if (e?.code === 'P2002')
                return res.status(400).json({ message: 'Collection name or slug already exists.' });
            res.status(400).json({ message: 'Failed to update collection', error: String(e) });
        }
    }
    static async deleteCollection(req, res) {
        try {
            await collection_service_1.CollectionService.deleteCollection(req.params.id);
            res.json({ message: 'Collection deleted' });
        }
        catch (e) {
            res.status(400).json({ message: 'Failed to delete collection', error: String(e) });
        }
    }
    static async exportCollections(req, res) {
        try {
            const workbook = await collection_service_1.CollectionService.exportCollectionsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="collections_export.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to export collections', error: String(error) });
        }
    }
    static async importCollections(req, res) {
        try {
            if (!req.file)
                return res.status(400).json({ message: 'No file uploaded' });
            const results = await collection_service_1.CollectionService.importCollections(req.file);
            res.json({ message: 'Import completed', results });
        }
        catch (err) {
            res.status(500).json({ message: 'Import failed', error: String(err) });
        }
    }
}
exports.CollectionController = CollectionController;
