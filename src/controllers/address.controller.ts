import { Request, Response } from 'express';
import { AddressService } from '../services/address.service';

export class AddressController {
    static async getMyAddresses(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const addresses = await AddressService.getAddressesByUserId(userId);
            res.json(addresses);
        } catch (e) {
            console.error('Get addresses error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async createAddress(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const address = await AddressService.createAddress(userId, req.body);
            res.status(201).json(address);
        } catch (e) {
            console.error('Create address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateAddress(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const addressId = req.params.id as string;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const existing = await AddressService.getAddressById(addressId);
            if (!existing) return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

            const updated = await AddressService.updateAddress(addressId, userId, req.body);
            res.json(updated);
        } catch (e) {
            console.error('Update address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async deleteAddress(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const addressId = req.params.id as string;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const existing = await AddressService.getAddressById(addressId);
            if (!existing) return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

            await AddressService.deleteAddress(addressId);
            res.status(204).send();
        } catch (e) {
            console.error('Delete address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async setDefault(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const addressId = req.params.id as string;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const existing = await AddressService.getAddressById(addressId);
            if (!existing) return res.status(404).json({ message: 'Address not found' });
            if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

            const updated = await AddressService.setDefaultAddress(addressId, userId);
            res.json(updated);
        } catch (e) {
            console.error('Set default address error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
