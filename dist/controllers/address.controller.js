"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const address_service_1 = require("../services/address.service");
class AddressController {
    static async getMyAddresses(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const addresses = await address_service_1.AddressService.getAddressesByUserId(userId);
            res.json(addresses);
        }
        catch (e) {
            console.error('Get addresses error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async createAddress(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const address = await address_service_1.AddressService.createAddress(userId, req.body);
            res.status(201).json(address);
        }
        catch (e) {
            console.error('Create address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateAddress(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const existing = await address_service_1.AddressService.getAddressById(addressId);
            if (!existing)
                return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId)
                return res.status(403).json({ message: 'Forbidden' });
            const updated = await address_service_1.AddressService.updateAddress(addressId, userId, req.body);
            res.json(updated);
        }
        catch (e) {
            console.error('Update address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async deleteAddress(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const existing = await address_service_1.AddressService.getAddressById(addressId);
            if (!existing)
                return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId)
                return res.status(403).json({ message: 'Forbidden' });
            await address_service_1.AddressService.deleteAddress(addressId);
            res.status(204).send();
        }
        catch (e) {
            console.error('Delete address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async setDefault(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params.id;
            if (!userId)
                return res.status(401).json({ message: 'Unauthorized' });
            const existing = await address_service_1.AddressService.getAddressById(addressId);
            if (!existing)
                return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId)
                return res.status(403).json({ message: 'Forbidden' });
            const updated = await address_service_1.AddressService.setDefaultAddress(addressId, userId);
            res.json(updated);
        }
        catch (e) {
            console.error('Set default address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.AddressController = AddressController;
