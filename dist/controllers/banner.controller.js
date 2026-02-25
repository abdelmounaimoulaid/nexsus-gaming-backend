"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerController = void 0;
const banner_service_1 = require("../services/banner.service");
class BannerController {
    static async getBanners(req, res) {
        try {
            const banners = await banner_service_1.BannerService.getBanners();
            res.json(banners);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch banners' });
        }
    }
    static async createBanner(req, res) {
        try {
            const banner = await banner_service_1.BannerService.createBanner(req.body);
            res.json(banner);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to create banner' });
        }
    }
    static async updateBanner(req, res) {
        try {
            const banner = await banner_service_1.BannerService.updateBanner(req.params.id, req.body);
            res.json(banner);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to update banner' });
        }
    }
    static async deleteBanner(req, res) {
        try {
            await banner_service_1.BannerService.deleteBanner(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to delete banner' });
        }
    }
}
exports.BannerController = BannerController;
