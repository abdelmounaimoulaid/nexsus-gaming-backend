"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    static async getUsers(req, res) {
        try {
            const users = await user_service_1.UserService.getUsers(req.query);
            res.json(users);
        }
        catch (e) {
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async createUser(req, res) {
        try {
            const { email, password, systemRole } = req.body;
            if (!email || !password || !systemRole) {
                return res.status(400).json({ message: 'email, password and systemRole are required' });
            }
            const exists = await user_service_1.UserService.checkEmailExists(email);
            if (exists)
                return res.status(409).json({ message: 'Email already in use' });
            const authorId = req.user?.id;
            const user = await user_service_1.UserService.createUser(req.body, authorId);
            res.status(201).json(user);
        }
        catch (e) {
            console.error('Create user error:', e);
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async updateUser(req, res) {
        try {
            const authorId = req.user?.id;
            const user = await user_service_1.UserService.updateUser(req.params.id, req.body, authorId);
            res.json(user);
        }
        catch (e) {
            if (e.code === 'P2025')
                return res.status(404).json({ message: 'User not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
    static async deleteUser(req, res) {
        try {
            const user = await user_service_1.UserService.getUserById(req.params.id);
            if (!user)
                return res.status(404).json({ message: 'User not found' });
            if (user.role?.isSystem) {
                return res.status(403).json({ message: 'System accounts are protected and cannot be deleted.' });
            }
            await user_service_1.UserService.deleteUser(req.params.id);
            res.status(204).send();
        }
        catch (e) {
            if (e.code === 'P2025')
                return res.status(404).json({ message: 'User not found' });
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.UserController = UserController;
