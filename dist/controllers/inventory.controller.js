"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
class InventoryController {
    static async getInventory(req, res) {
        try {
            const result = await inventory_service_1.InventoryService.getInventory(req.query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch inventory', error: String(error) });
        }
    }
    static async updateStock(req, res) {
        try {
            const id = req.params.id;
            const { stock } = req.body;
            const userId = req.user?.id;
            if (typeof stock !== 'number') {
                return res.status(400).json({ message: 'Stock must be a number' });
            }
            const updated = await inventory_service_1.InventoryService.updateStock(id, stock, userId);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to update stock', error: String(error) });
        }
    }
    static async bulkUpdateStock(req, res) {
        try {
            const { updates } = req.body;
            const userId = req.user?.id;
            if (!Array.isArray(updates)) {
                return res.status(400).json({ message: 'Updates must be an array' });
            }
            const result = await inventory_service_1.InventoryService.bulkUpdateStock(updates, userId);
            res.json({ success: true, count: result.length });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to bulk update stock', error: String(error) });
        }
    }
}
exports.InventoryController = InventoryController;
