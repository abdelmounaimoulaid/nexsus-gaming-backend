"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhishlistController = void 0;
const whishlist_service_1 = require("../services/whishlist.service");
class WhishlistController {
    static async toggleWhishlist(req, res) {
        try {
            const userId = req.user?.id;
            const { productId } = req.body;
            if (!productId) {
                return res.status(400).json({ message: 'Product ID is required' });
            }
            const result = await whishlist_service_1.WhishlistService.toggleWhishlist(userId, productId);
            return res.json(result);
        }
        catch (error) {
            console.error('Toggle whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getWhishlist(req, res) {
        try {
            const userId = req.user?.id;
            const favorites = await whishlist_service_1.WhishlistService.getUserWhishlist(userId);
            return res.json(favorites);
        }
        catch (error) {
            console.error('Get whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async syncWhishlist(req, res) {
        try {
            const userId = req.user?.id;
            const { productIds } = req.body;
            if (!Array.isArray(productIds)) {
                return res.status(400).json({ message: 'productIds must be an array' });
            }
            const favorites = await whishlist_service_1.WhishlistService.syncWhishlist(userId, productIds);
            return res.json(favorites);
        }
        catch (error) {
            console.error('Sync whishlist error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.WhishlistController = WhishlistController;
