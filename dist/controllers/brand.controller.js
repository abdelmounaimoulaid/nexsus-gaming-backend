"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const brand_service_1 = require("../services/brand.service");
class BrandController {
    static async getBrands(req, res) {
        try {
            const brands = await brand_service_1.BrandService.getBrands();
            res.json(brands);
        }
        catch (e) {
            res.status(500).json({ message: 'Failed to fetch brands', error: String(e) });
        }
    }
    static async getBrandById(req, res) {
        try {
            const brand = await brand_service_1.BrandService.getBrandById(req.params.id);
            if (!brand)
                return res.status(404).json({ message: 'Brand not found' });
            res.json(brand);
        }
        catch (e) {
            res.status(500).json({ message: 'Failed to fetch brand' });
        }
    }
    static async createBrand(req, res) {
        try {
            const userId = req.user?.id;
            const brand = await brand_service_1.BrandService.createBrand(req.body, userId);
            res.json(brand);
        }
        catch (e) {
            if (e?.code === 'P2002')
                return res.status(400).json({ message: 'Brand name or slug already exists.' });
            res.status(400).json({ message: 'Failed to create brand', error: String(e) });
        }
    }
    static async updateBrand(req, res) {
        try {
            const userId = req.user?.id;
            const brand = await brand_service_1.BrandService.updateBrand(req.params.id, req.body, userId);
            res.json(brand);
        }
        catch (e) {
            if (e?.code === 'P2002')
                return res.status(400).json({ message: 'Brand name or slug already exists.' });
            res.status(400).json({ message: 'Failed to update brand', error: String(e) });
        }
    }
    static async deleteBrand(req, res) {
        try {
            await brand_service_1.BrandService.deleteBrand(req.params.id);
            res.json({ message: 'Brand deleted' });
        }
        catch (e) {
            res.status(400).json({ message: 'Failed to delete brand', error: String(e) });
        }
    }
    static async exportBrands(req, res) {
        try {
            const workbook = await brand_service_1.BrandService.exportBrandsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="brands_export.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to export brands', error: String(error) });
        }
    }
    static async importBrands(req, res) {
        try {
            if (!req.file)
                return res.status(400).json({ message: 'No file uploaded' });
            const results = await brand_service_1.BrandService.importBrands(req.file);
            res.json({ message: 'Import completed', results });
        }
        catch (err) {
            res.status(500).json({ message: 'Import failed', error: String(err) });
        }
    }
}
exports.BrandController = BrandController;
