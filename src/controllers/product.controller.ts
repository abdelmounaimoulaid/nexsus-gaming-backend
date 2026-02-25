import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
    static async getProducts(req: Request, res: Response) {
        try {
            const result = await ProductService.getProducts(req.query);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch products', error: String(error) });
        }
    }

    static async exportProducts(req: Request, res: Response) {
        try {
            const workbook = await ProductService.exportProductsToExcel();
            const date = new Date().toISOString().split('T')[0];

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="nexus-products-${date}.xlsx"`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error: any) {
            res.status(500).json({ message: 'Export failed', detail: error?.message });
        }
    }

    static async getProductById(req: Request, res: Response) {
        try {
            const product = await ProductService.getProductById(req.params.id as string);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch product', error: String(error) });
        }
    }

    static async createProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const product = await ProductService.createProduct(req.body, userId);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create product', error: String(error) });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const product = await ProductService.updateProduct(req.params.id as string, req.body, userId);
            res.json(product);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update product', error: String(error) });
        }
    }

    static async importProducts(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
            }
            const results = await ProductService.importProducts(req.file);
            res.json({ message: 'Import completed', results });
        } catch (error: any) {
            res.status(500).json({ message: 'Import failed', detail: error?.message });
        }
    }

    static async bulkDeleteProducts(req: Request, res: Response) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'No product IDs provided.' });
            }
            const result = await ProductService.bulkDeleteProducts(ids);
            res.json({ success: true, count: result.count });
        } catch (error) {
            res.status(400).json({ message: 'Failed to bulk delete products', error: String(error) });
        }
    }

    static async deleteProduct(req: Request, res: Response) {
        try {
            await ProductService.deleteProduct(req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete product', error: String(error) });
        }
    }
}
