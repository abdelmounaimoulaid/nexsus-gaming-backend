"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            const order = await order_service_1.OrderService.createOrder({
                ...req.body,
                userId
            });
            res.status(201).json(order);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getAll(req, res) {
        try {
            const orders = await order_service_1.OrderService.getAllOrders(req.query);
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async getById(req, res) {
        try {
            const order = await order_service_1.OrderService.getOrderById(req.params.id);
            if (!order)
                return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    static async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const order = await order_service_1.OrderService.updateOrderStatus(req.params.id, status);
            res.json(order);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async delete(req, res) {
        try {
            await order_service_1.OrderService.deleteOrder(req.params.id);
            res.json({ message: 'Order deleted successfully' });
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.OrderController = OrderController;
