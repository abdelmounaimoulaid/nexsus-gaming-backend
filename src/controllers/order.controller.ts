import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
    static async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const order = await OrderService.createOrder({
                ...req.body,
                userId
            });
            res.status(201).json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const orders = await OrderService.getAllOrders(req.query);
            res.json(orders);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const order = await OrderService.getOrderById(req.params.id as string);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const order = await OrderService.updateOrderStatus(req.params.id as string, status);
            res.json(order);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await OrderService.deleteOrder(req.params.id as string);
            res.json({ message: 'Order deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
