"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const result = await auth_service_1.AuthService.login(email, password);
            return res.json(result);
        }
        catch (error) {
            if (error.message === 'Invalid credentials' || error.message.includes('Access denied')) {
                return res.status(401).json({ message: error.message });
            }
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current and new passwords are required' });
            }
            const result = await auth_service_1.AuthService.changePassword(userId, currentPassword, newPassword);
            return res.json(result);
        }
        catch (error) {
            if (error.message === 'Incorrect current password') {
                return res.status(401).json({ message: error.message });
            }
            console.error('Change password error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.AuthController = AuthController;
