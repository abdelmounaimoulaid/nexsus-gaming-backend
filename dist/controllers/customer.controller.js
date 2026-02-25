"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_service_1 = require("../services/customer.service");
class CustomerController {
    static async getCustomers(req, res) {
        try {
            const result = await customer_service_1.CustomerService.getCustomers(req.query);
            res.json(result);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async createCustomer(req, res) {
        try {
            const { email } = req.body;
            if (email) {
                const exists = await customer_service_1.CustomerService.checkEmailExists(email);
                if (exists)
                    return res.status(409).json({ message: 'Email already in use' });
            }
            const userId = req.user?.id;
            const customer = await customer_service_1.CustomerService.createCustomer(req.body, userId);
            res.status(201).json(customer);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateCustomer(req, res) {
        try {
            const userId = req.user?.id;
            const customer = await customer_service_1.CustomerService.updateCustomer(req.params.id, req.body, userId);
            res.json(customer);
        }
        catch (e) {
            if (e.code === 'P2025')
                return res.status(404).json({ message: 'Customer not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async deleteCustomer(req, res) {
        try {
            await customer_service_1.CustomerService.deleteCustomer(req.params.id);
            res.status(204).send();
        }
        catch (e) {
            if (e.code === 'P2025')
                return res.status(404).json({ message: 'Customer not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.CustomerController = CustomerController;
