import { Request, Response } from 'express';
import { BrandService } from '../services/brand.service';

export class BrandController {
    static async getBrands(req: Request, res: Response) {
        try {
            const brands = await BrandService.getBrands();
            res.json(brands);
        } catch (e) {
            res.status(500).json({ message: 'Failed to fetch brands', error: String(e) });
        }
    }

    static async getBrandById(req: Request, res: Response) {
        try {
            const brand = await BrandService.getBrandById(req.params.id as string);
            if (!brand) return res.status(404).json({ message: 'Brand not found' });
            res.json(brand);
        } catch (e) {
            res.status(500).json({ message: 'Failed to fetch brand' });
        }
    }

    static async createBrand(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const brand = await BrandService.createBrand(req.body, userId);
            res.json(brand);
        } catch (e: any) {
            if (e?.code === 'P2002') return res.status(400).json({ message: 'Brand name or slug already exists.' });
            res.status(400).json({ message: 'Failed to create brand', error: String(e) });
        }
    }

    static async updateBrand(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const brand = await BrandService.updateBrand(req.params.id as string, req.body, userId);
            res.json(brand);
        } catch (e: any) {
            if (e?.code === 'P2002') return res.status(400).json({ message: 'Brand name or slug already exists.' });
            res.status(400).json({ message: 'Failed to update brand', error: String(e) });
        }
    }

    static async deleteBrand(req: Request, res: Response) {
        try {
            await BrandService.deleteBrand(req.params.id as string);
            res.json({ message: 'Brand deleted' });
        } catch (e) {
            res.status(400).json({ message: 'Failed to delete brand', error: String(e) });
        }
    }

    static async exportBrands(req: Request, res: Response) {
        try {
            const workbook = await BrandService.exportBrandsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="brands_export.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            res.status(500).json({ message: 'Failed to export brands', error: String(error) });
        }
    }

    static async importBrands(req: Request, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
            const results = await BrandService.importBrands(req.file);
            res.json({ message: 'Import completed', results });
        } catch (err: any) {
            res.status(500).json({ message: 'Import failed', error: String(err) });
        }
    }
}
