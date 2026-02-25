import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
    static async getCustomers(req: Request, res: Response) {
        try {
            const result = await CustomerService.getCustomers(req.query);
            res.json(result);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async createCustomer(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (email) {
                const exists = await CustomerService.checkEmailExists(email);
                if (exists) return res.status(409).json({ message: 'Email already in use' });
            }

            const userId = (req as any).user?.id;
            const customer = await CustomerService.createCustomer(req.body, userId);
            res.status(201).json(customer);
        } catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async updateCustomer(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const customer = await CustomerService.updateCustomer(req.params.id as string, req.body, userId);
            res.json(customer);
        } catch (e: any) {
            if (e.code === 'P2025') return res.status(404).json({ message: 'Customer not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async deleteCustomer(req: Request, res: Response) {
        try {
            await CustomerService.deleteCustomer(req.params.id as string);
            res.status(204).send();
        } catch (e: any) {
            if (e.code === 'P2025') return res.status(404).json({ message: 'Customer not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
