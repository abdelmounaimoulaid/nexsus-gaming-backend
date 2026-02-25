import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
    static async getCategories(req: Request, res: Response) {
        try {
            const result = await CategoryService.getCategories(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch categories' });
        }
    }

    static async createCategory(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const newCategory = await CategoryService.createCategory(req.body, userId);
            res.json(newCategory);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create category', error });
        }
    }

    static async updateCategory(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const category = await CategoryService.updateCategory(req.params.id as string, req.body, userId);
            res.json(category);
        } catch (error: any) {
            console.error('[PUT /categories/:id] Error:', error?.message || error);
            res.status(400).json({ message: 'Failed to update category', detail: error?.message });
        }
    }

    static async deleteCategory(req: Request, res: Response) {
        try {
            await CategoryService.deleteCategory(req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete category' });
        }
    }

    static async exportCategories(req: Request, res: Response) {
        try {
            const workbook = await CategoryService.exportCategoriesToExcel();
            const date = new Date().toISOString().split('T')[0];
            const filename = `nexus-categories-${date}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error: any) {
            console.error('[GET /categories/export] Error:', error?.message);
            res.status(500).json({ message: 'Export failed', detail: error?.message });
        }
    }

    static async importCategories(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            const results = await CategoryService.importCategories(req.file);
            res.json({ message: `Import complete. ${results.created} created, ${results.updated} updated.`, ...results });
        } catch (error: any) {
            res.status(500).json({ message: 'Import failed', error: error.message });
        }
    }
}
