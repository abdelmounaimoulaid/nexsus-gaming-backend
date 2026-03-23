"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
class ProductController {
    static async getProducts(req, res) {
        try {
            const result = await product_service_1.ProductService.getProducts(req.query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch products', error: String(error) });
        }
    }
    static async exportProducts(req, res) {
        try {
            const workbook = await product_service_1.ProductService.exportProductsToExcel();
            const date = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="nexus-products-${date}.xlsx"`);
            await workbook.xlsx.write(res);
            res.end();
        }
        catch (error) {
            res.status(500).json({ message: 'Export failed', detail: error?.message });
        }
    }
    static async exportImportTemplate(req, res) {
        try {
            const workbook = await product_service_1.ProductService.exportImportTemplateToExcel();
            const date = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="nexus-import-template-${date}.xlsx"`);
            await workbook.xlsx.write(res);
            res.end();
        }
        catch (error) {
            res.status(500).json({ message: 'Template export failed', detail: error?.message });
        }
    }
    static async getProductById(req, res) {
        try {
            const product = await product_service_1.ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch product', error: String(error) });
        }
    }
    static async createProduct(req, res) {
        try {
            const userId = req.user?.id;
            const product = await product_service_1.ProductService.createProduct(req.body, userId);
            res.status(201).json(product);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to create product', error: String(error) });
        }
    }
    static async updateProduct(req, res) {
        try {
            const userId = req.user?.id;
            const product = await product_service_1.ProductService.updateProduct(req.params.id, req.body, userId);
            res.json(product);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to update product', error: String(error) });
        }
    }
    static async importProducts(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            res.flushHeaders();
            const results = await product_service_1.ProductService.importProducts(req.file, (current, total, currentResults) => {
                res.write(`data: ${JSON.stringify({ type: 'progress', current, total, results: currentResults })}\n\n`);
            });
            res.write(`data: ${JSON.stringify({ type: 'complete', message: 'Import completed', results })}\n\n`);
            res.end();
        }
        catch (error) {
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Import failed', detail: error?.message })}\n\n`);
            res.end();
        }
    }
    static async bulkDeleteProducts(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No product IDs provided.' });
            }
            const result = await product_service_1.ProductService.bulkDeleteProducts(ids);
            res.json({ success: true, count: result.count });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to bulk delete products', error: String(error) });
        }
    }
    static async bulkOutOfStockProducts(req, res) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No product IDs provided.' });
            }
            const userId = req.user?.id;
            const result = await product_service_1.ProductService.bulkOutOfStockProducts(ids, userId);
            res.json({ success: true, count: result.count });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to bulk out-of-stock products', error: String(error) });
        }
    }
    static async bulkUpdateStockStatus(req, res) {
        try {
            const { ids, status } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No product IDs provided.' });
            }
            if (!['IN_STOCK', 'OUT_OF_STOCK'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status. Must be IN_STOCK or OUT_OF_STOCK.' });
            }
            const userId = req.user?.id;
            const result = await product_service_1.ProductService.bulkUpdateStockStatus(ids, status, userId);
            res.json({ success: true, count: result.count });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to bulk update stock status', error: String(error) });
        }
    }
    static async bulkUpdateCategory(req, res) {
        try {
            const { ids, categoryId } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No product IDs provided.' });
            }
            if (!categoryId) {
                return res.status(400).json({ message: 'No category ID provided.' });
            }
            const userId = req.user?.id;
            const result = await product_service_1.ProductService.bulkUpdateCategory(ids, categoryId, userId);
            res.json({ success: true, count: result.count });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to bulk update category', error: String(error) });
        }
    }
    static async deleteProduct(req, res) {
        try {
            await product_service_1.ProductService.deleteProduct(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to delete product', error: String(error) });
        }
    }
}
exports.ProductController = ProductController;
