"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
class CategoryController {
    static async getCategories(req, res) {
        try {
            const result = await category_service_1.CategoryService.getCategories(req.query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch categories' });
        }
    }
    static async createCategory(req, res) {
        try {
            const userId = req.user?.id;
            const newCategory = await category_service_1.CategoryService.createCategory(req.body, userId);
            res.json(newCategory);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to create category', error });
        }
    }
    static async updateCategory(req, res) {
        try {
            const userId = req.user?.id;
            const category = await category_service_1.CategoryService.updateCategory(req.params.id, req.body, userId);
            res.json(category);
        }
        catch (error) {
            console.error('[PUT /categories/:id] Error:', error?.message || error);
            res.status(400).json({ message: 'Failed to update category', detail: error?.message });
        }
    }
    static async deleteCategory(req, res) {
        try {
            await category_service_1.CategoryService.deleteCategory(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to delete category' });
        }
    }
    static async exportCategories(req, res) {
        try {
            const workbook = await category_service_1.CategoryService.exportCategoriesToExcel();
            const date = new Date().toISOString().split('T')[0];
            const filename = `nexus-categories-${date}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            await workbook.xlsx.write(res);
            res.end();
        }
        catch (error) {
            console.error('[GET /categories/export] Error:', error?.message);
            res.status(500).json({ message: 'Export failed', detail: error?.message });
        }
    }
    static async importCategories(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            const results = await category_service_1.CategoryService.importCategories(req.file);
            res.json({ message: `Import complete. ${results.created} created, ${results.updated} updated.`, ...results });
        }
        catch (error) {
            res.status(500).json({ message: 'Import failed', error: error.message });
        }
    }
}
exports.CategoryController = CategoryController;
