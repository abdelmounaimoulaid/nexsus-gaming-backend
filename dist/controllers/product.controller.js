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
            const results = await product_service_1.ProductService.importProducts(req.file);
            res.json({ message: 'Import completed', results });
        }
        catch (error) {
            res.status(500).json({ message: 'Import failed', detail: error?.message });
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
